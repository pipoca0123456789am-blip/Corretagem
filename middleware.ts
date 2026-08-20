import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'ih_admin_session'
const APP_COOKIE = 'ih_app_session'

const ADMIN_PUBLIC = [
  '/admin/login',
  '/admin/esqueci-senha',
  '/admin/redefinir-senha',
  '/admin/acesso-negado',
]

function parseSession(raw: string | undefined): { role?: string; realm?: string } | null {
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
}

function isAdminRole(role?: string) {
  return role === 'super_admin' || role === 'admin' || role === 'suporte' || role === 'financeiro'
}

function isRealtorRole(role?: string) {
  return role === 'corretor' || role === 'assistente'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const admin = parseSession(request.cookies.get(ADMIN_COOKIE)?.value)
  const app = parseSession(request.cookies.get(APP_COOKIE)?.value)

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const isPublic = ADMIN_PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`))

    if (isPublic) {
      if (pathname === '/admin/login' && admin && isAdminRole(admin.role) && admin.realm === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.next()
    }

    if (!admin || !isAdminRole(admin.role) || admin.realm !== 'admin') {
      // Corretor autenticado tentando admin → negado
      if (app && isRealtorRole(app.role)) {
        return NextResponse.redirect(new URL('/admin/acesso-negado', request.url))
      }
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
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
    const ok = app && app.realm === 'app' && isRealtorRole(app.role)
    if (!ok) {
      if (admin && isAdminRole(admin.role)) {
        return NextResponse.redirect(new URL('/acesso-negado', request.url))
      }
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
