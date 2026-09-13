import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_COOKIE = 'ih_admin_sid'
const APP_COOKIE = 'ih_app_sid'
const CLIENT_COOKIE = 'ih_client_sid'
/** Legado — rejeitado (forjável). */
const LEGACY_ADMIN = 'ih_admin_session'
const LEGACY_APP = 'ih_app_session'

const ADMIN_PUBLIC = [
  '/admin/login',
  '/admin/esqueci-senha',
  '/admin/redefinir-senha',
  '/admin/acesso-negado',
  '/admin/security/2fa', // enrollment sem sessão completa (challengeId)
]

const CLIENT_PUBLIC_SUFFIXES = ['/login', '/cadastro', '/recuperar-senha']

const DEV_FALLBACK = 'imovelhub-dev-auth-secret-change-me-32b'

function isProductionLike() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

function getSecret(): Uint8Array | null {
  const raw = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!raw || raw.length < 32) {
    if (isProductionLike()) return null
    return new TextEncoder().encode(DEV_FALLBACK)
  }
  return new TextEncoder().encode(raw)
}

async function readClaims(token: string | undefined) {
  if (!token) return null
  const secret = getSecret()
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return payload as {
      role?: string
      realm?: string
      sub?: string
      sid?: string
      realtorId?: number | null
    }
  } catch {
    return null
  }
}

function isAdminRole(role?: string) {
  return role === 'super_admin' || role === 'admin' || role === 'suporte' || role === 'financeiro'
}

function isRealtorRole(role?: string) {
  return role === 'corretor' || role === 'assistente'
}

function clearLegacy(response: NextResponse) {
  response.cookies.set(LEGACY_ADMIN, '', { path: '/', maxAge: 0 })
  response.cookies.set(LEGACY_APP, '', { path: '/', maxAge: 0 })
}

function isClientPublicPath(pathname: string) {
  // /cliente/[slug]/login|cadastro|recuperar-senha
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] !== 'cliente') return false
  if (parts.length === 1) return true // /cliente index
  if (parts.length === 2) return false // /cliente/[slug] painel — protegido
  const suffix = `/${parts[2]}`
  return CLIENT_PUBLIC_SUFFIXES.includes(suffix)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const hasLegacy = request.cookies.has(LEGACY_ADMIN) || request.cookies.has(LEGACY_APP)

  const admin = await readClaims(request.cookies.get(ADMIN_COOKIE)?.value)
  const app = await readClaims(request.cookies.get(APP_COOKIE)?.value)
  const client = await readClaims(request.cookies.get(CLIENT_COOKIE)?.value)

  const isPainelAdmin = pathname === '/paineladmin'
  const isAdminArea = isPainelAdmin || pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdminArea) {
    const isPublic = ADMIN_PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))

    if (isPublic) {
      if (
        pathname === '/admin/login' &&
        admin &&
        isAdminRole(admin.role) &&
        admin.realm === 'admin'
      ) {
        const res = NextResponse.redirect(new URL('/paineladmin', request.url))
        if (hasLegacy) clearLegacy(res)
        return res
      }
      const res = NextResponse.next()
      if (hasLegacy) clearLegacy(res)
      return res
    }

    if (!admin || !isAdminRole(admin.role) || admin.realm !== 'admin' || !admin.sid || !admin.sub) {
      if (app && isRealtorRole(app.role)) {
        const res = NextResponse.redirect(new URL('/admin/acesso-negado', request.url))
        if (hasLegacy) clearLegacy(res)
        return res
      }
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('next', isPainelAdmin ? '/paineladmin' : pathname)
      const res = NextResponse.redirect(url)
      if (hasLegacy) clearLegacy(res)
      return res
    }
    const res = NextResponse.next()
    if (hasLegacy) clearLegacy(res)
    return res
  }

  // Portal do cliente — cookie ih_client_sid (ou Super Admin via ih_admin_sid)
  if (pathname === '/cliente' || pathname.startsWith('/cliente/')) {
    if (isClientPublicPath(pathname)) {
      const res = NextResponse.next()
      if (hasLegacy) clearLegacy(res)
      return res
    }

    const adminOk =
      admin && isAdminRole(admin.role) && admin.realm === 'admin' && admin.sid && admin.sub
    const clientOk =
      client &&
      client.realm === 'client' &&
      client.role === 'cliente' &&
      client.sid &&
      client.sub

    if (!adminOk && !clientOk) {
      const parts = pathname.split('/').filter(Boolean)
      const slug = parts[1] || 'corretor-demonstracao'
      const url = request.nextUrl.clone()
      url.pathname = `/cliente/${slug}/login`
      url.searchParams.set('next', pathname)
      const res = NextResponse.redirect(url)
      if (hasLegacy) clearLegacy(res)
      return res
    }

    const res = NextResponse.next()
    if (hasLegacy) clearLegacy(res)
    return res
  }

  const realtorProtectedPrefixes = [
    '/dashboard',
    '/properties',
    '/imoveis',
    '/clients',
    '/clientes',
    '/crm',
    '/agenda',
    '/visits',
    '/visitas',
    '/negotiations',
    '/negociacoes',
    '/financial',
    '/financeiro',
    '/professional',
    '/minha-pagina',
    '/ai',
    '/minha-ia',
    '/plans',
    '/assinatura',
    '/help',
    '/suporte',
    '/settings',
    '/configuracoes',
    '/profile',
    '/reports',
    '/documents',
    '/team',
    '/solicitacoes',
    '/notificacoes',
    '/integrations',
    '/campanhas',
    '/onboarding',
    '/meu-site',
  ]

  const needsAppAuth = realtorProtectedPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )

  if (needsAppAuth) {
    const ok = app && app.realm === 'app' && isRealtorRole(app.role) && app.sid && app.sub
    if (!ok) {
      if (admin && isAdminRole(admin.role)) {
        const res = NextResponse.redirect(new URL('/acesso-negado', request.url))
        if (hasLegacy) clearLegacy(res)
        return res
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      const res = NextResponse.redirect(url)
      if (hasLegacy) clearLegacy(res)
      return res
    }
  }

  const res = NextResponse.next()
  if (hasLegacy) clearLegacy(res)
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
