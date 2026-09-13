import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateUser, isAdminRole, isRealtorAppRole, toPublicUser } from '@/lib/server/users'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { safeInternalPath } from '@/lib/server/safe-redirect'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
})

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`app-login:${ip}`, 20, 15 * 60 * 1000)
  if (!rl.ok) {
    await appendSecurityEvent({
      type: 'security.rate_limited',
      result: 'denied',
      ip,
      detail: 'app-login',
    })
    return NextResponse.json(
      { ok: false, error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Dados inválidos' }, { status: 400 })
  }

  const { email, password, next } = parsed.data
  const auth = await authenticateUser(email, password)
  if (!auth.ok) {
    await appendSecurityEvent({
      type: 'auth.login.failed',
      result: 'denied',
      email,
      ip,
      realm: 'app',
    })
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 })
  }

  if (isAdminRole(auth.user.role)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Esta conta é administrativa. Use /admin/login.',
        hintAdmin: true,
      },
      { status: 403 }
    )
  }

  if (auth.user.role === 'cliente') {
    return NextResponse.json({
      ok: true,
      user: toPublicUser(auth.user),
      redirectTo: '/cliente/corretor-demonstracao/login',
    })
  }

  if (!isRealtorAppRole(auth.user.role)) {
    return NextResponse.json({ ok: false, error: 'Conta sem acesso ao painel.' }, { status: 403 })
  }

  const { token, maxAge } = await createSessionToken({
    userId: auth.user.id,
    email: auth.user.email,
    name: auth.user.name,
    role: auth.user.role,
    realm: 'app',
    realtorId: auth.user.realtorId,
  })
  await setSessionCookie('app', token, maxAge)

  await appendSecurityEvent({
    type: 'auth.login.success',
    result: 'ok',
    userId: auth.user.id,
    email: auth.user.email,
    ip,
    realm: 'app',
  })

  return NextResponse.json({
    ok: true,
    user: toPublicUser(auth.user),
    redirectTo: safeInternalPath(next, '/dashboard'),
  })
}
