import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateUser, toPublicUser } from '@/lib/server/users'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { resolveRealtorBySlug } from '@/lib/server/realtor-slug'
import { safeInternalPath } from '@/lib/server/safe-redirect'
import { assertAuthInfrastructure } from '@/lib/server/env'
import { upsertClientBrokerLink } from '@/lib/server/client-broker-link'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  realtorSlug: z.string().min(1),
  next: z.string().optional(),
  broker_id: z.unknown().optional(),
  realtorId: z.unknown().optional(),
  tenant_id: z.unknown().optional(),
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
  const rl = await rateLimit(`client-login:${ip}`, 20, 15 * 60 * 1000)
  if (!rl.ok) {
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

  const { email, password, realtorSlug, next } = parsed.data
  const profile = resolveRealtorBySlug(realtorSlug)
  if (!profile) {
    return NextResponse.json({ ok: false, error: 'Corretor não encontrado.' }, { status: 404 })
  }

  const auth = await authenticateUser(email, password)
  if (!auth.ok) {
    await appendSecurityEvent({
      type: 'auth.login.failed',
      result: 'denied',
      email,
      ip,
      realm: 'client',
    })
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 })
  }

  if (auth.user.role !== 'cliente') {
    return NextResponse.json(
      { ok: false, error: 'Esta conta não é de cliente. Use o login correspondente.' },
      { status: 403 }
    )
  }

  if (auth.user.realtorId == null || auth.user.realtorId !== profile.id) {
    await appendSecurityEvent({
      type: 'auth.permission_denied',
      result: 'denied',
      email,
      ip,
      realm: 'client',
      detail: 'client-tenant-mismatch',
    })
    return NextResponse.json(
      { ok: false, error: 'Cliente não vinculado a este corretor.' },
      { status: 403 }
    )
  }

  await upsertClientBrokerLink({
    clientUserId: auth.user.id,
    tenantRealtorId: profile.id,
    brokerId: profile.id,
    referralSlug: profile.slug,
    source: 'portal-login',
  })

  const { token, maxAge } = await createSessionToken({
    userId: auth.user.id,
    email: auth.user.email,
    name: auth.user.name,
    role: auth.user.role,
    realm: 'client',
    realtorId: auth.user.realtorId,
    ip,
  })
  await setSessionCookie('client', token, maxAge)

  await appendSecurityEvent({
    type: 'auth.login.success',
    result: 'ok',
    userId: auth.user.id,
    email: auth.user.email,
    ip,
    realm: 'client',
  })

  const fallback = `/cliente/${profile.slug}`
  return NextResponse.json({
    ok: true,
    user: toPublicUser(auth.user),
    realtorSlug: profile.slug,
    realtorId: profile.id,
    redirectTo: safeInternalPath(next, fallback),
  })
}
