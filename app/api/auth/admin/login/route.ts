import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateUser, isAdminRole, toPublicUser, findUserById } from '@/lib/server/users'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { safeInternalPath } from '@/lib/server/safe-redirect'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { createAdmin2faChallenge } from '@/lib/server/admin-2fa-challenge'
import { isAdmin2faEnforcementEnabled, shouldRequireAdmin2fa } from '@/lib/server/totp'
import { assertAuthInfrastructure } from '@/lib/server/env'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    assertAuthInfrastructure()
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Ambiente inválido' },
      { status: 503 }
    )
  }

  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`admin-login:${ip}`, 10, 15 * 60 * 1000)
  if (!rl.ok) {
    await appendSecurityEvent({
      type: 'security.rate_limited',
      result: 'denied',
      ip,
      detail: 'admin-login',
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
      realm: 'admin',
      detail: auth.error,
    })
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 })
  }

  if (!isAdminRole(auth.user.role)) {
    await appendSecurityEvent({
      type: 'auth.permission_denied',
      result: 'denied',
      email,
      ip,
      realm: 'admin',
      detail: 'not-admin-role',
    })
    return NextResponse.json(
      { ok: false, error: 'Esta conta não possui permissão administrativa.' },
      { status: 403 }
    )
  }

  const fresh = (await findUserById(auth.user.id)) || auth.user

  // 2FA enrolled → desafio (sem cookie de sessão completa)
  if (fresh.totpEnabled) {
    const challengeId = await createAdmin2faChallenge({
      userId: fresh.id,
      email: fresh.email,
      next,
    })
    await appendSecurityEvent({
      type: 'auth.login.success',
      result: 'ok',
      userId: fresh.id,
      email: fresh.email,
      ip,
      realm: 'admin',
      detail: 'pending-2fa',
    })
    return NextResponse.json({
      ok: true,
      requires2fa: true,
      challengeId,
      user: toPublicUser(fresh),
    })
  }

  // REQUIRE_ADMIN_2FA / prod: NÃO emitir sessão completa antes do enrollment TOTP
  if (shouldRequireAdmin2fa(fresh) || isAdmin2faEnforcementEnabled()) {
    const challengeId = await createAdmin2faChallenge({
      userId: fresh.id,
      email: fresh.email,
      next,
    })
    await appendSecurityEvent({
      type: 'auth.login.success',
      result: 'ok',
      userId: fresh.id,
      email: fresh.email,
      ip,
      realm: 'admin',
      detail: 'pending-2fa-setup',
    })
    return NextResponse.json({
      ok: true,
      requires2faSetup: true,
      challengeId,
      user: toPublicUser(fresh),
      redirectTo: '/admin/security/2fa',
      message: 'Configure o 2FA antes de acessar o painel.',
    })
  }

  const { token, maxAge } = await createSessionToken({
    userId: auth.user.id,
    email: auth.user.email,
    name: auth.user.name,
    role: auth.user.role,
    realm: 'admin',
    realtorId: auth.user.realtorId,
    ip,
  })
  await setSessionCookie('admin', token, maxAge)

  await appendSecurityEvent({
    type: 'auth.login.success',
    result: 'ok',
    userId: auth.user.id,
    email: auth.user.email,
    ip,
    realm: 'admin',
  })

  return NextResponse.json({
    ok: true,
    user: toPublicUser(auth.user),
    requires2faSetup: false,
    redirectTo: safeInternalPath(next, '/paineladmin'),
  })
}
