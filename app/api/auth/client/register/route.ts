import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertPasswordPolicy, hashPassword } from '@/lib/server/password'
import { createClientUser, toPublicUser, findUserByEmail } from '@/lib/server/users'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { resolveRealtorBySlug } from '@/lib/server/realtor-slug'
import { isDevSeedEnabled } from '@/lib/server/secrets'
import { assertAuthInfrastructure } from '@/lib/server/env'
import { upsertClientBrokerLink } from '@/lib/server/client-broker-link'
import { createOtp } from '@/lib/server/otp'
import { sendOtpEmail } from '@/lib/server/email'
import { isProductionRuntime } from '@/lib/server/secrets'

const bodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(30).optional(),
  password: z.string().min(1),
  realtorSlug: z.string().min(1),
  // Ignorados de propósito — anti-IDOR
  broker_id: z.unknown().optional(),
  realtorId: z.unknown().optional(),
  tenant_id: z.unknown().optional(),
})

/**
 * Cadastro de cliente vinculado ao corretor do slug (resolvido no servidor).
 * Em DEV seed: ativa imediatamente; em prod: pending até e-mail real.
 */
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
  const rl = await rateLimit(`client-register:${ip}`, 10, 60 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Muitas tentativas. Tente mais tarde.' },
      { status: 429 }
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

  const profile = resolveRealtorBySlug(parsed.data.realtorSlug)
  if (!profile) {
    return NextResponse.json({ ok: false, error: 'Corretor não encontrado.' }, { status: 404 })
  }

  const policy = assertPasswordPolicy(parsed.data.password)
  if (!policy.ok) {
    return NextResponse.json({ ok: false, error: policy.error }, { status: 400 })
  }

  const existing = await findUserByEmail(parsed.data.email)
  if (existing) {
    return NextResponse.json({ ok: false, error: 'E-mail já cadastrado.' }, { status: 409 })
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password)
    const activateImmediately = isDevSeedEnabled()
    const user = await createClientUser({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      realtorId: profile.id,
      activateImmediately,
    })

    await upsertClientBrokerLink({
      clientUserId: user.id,
      tenantRealtorId: profile.id,
      brokerId: profile.id,
      referralSlug: profile.slug,
      source: 'portal',
    })

    if (user.status === 'pending_verification') {
      const otp = createOtp(user.id, user.email)
      if (!('error' in otp)) {
        const sent = await sendOtpEmail(user.email, otp.code)
        if (!sent.ok) {
          await appendSecurityEvent({
            type: 'auth.otp.sent',
            result: 'error',
            userId: user.id,
            email: user.email,
            ip,
            realm: 'client',
            detail: sent.error || 'email-not-sent',
          })
          // Mantém pending_verification — não finge sucesso de e-mail
        } else {
          await appendSecurityEvent({
            type: 'auth.otp.sent',
            result: 'ok',
            userId: user.id,
            email: user.email,
            ip,
            realm: 'client',
          })
        }
      }
    }

    if (user.status === 'ativo') {
      const { token, maxAge } = await createSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        realm: 'client',
        realtorId: user.realtorId,
        ip,
      })
      await setSessionCookie('client', token, maxAge)
    }

    await appendSecurityEvent({
      type: 'auth.register',
      result: 'ok',
      userId: user.id,
      email: user.email,
      ip,
      realm: 'client',
    })

    const payload: Record<string, unknown> = {
      ok: true,
      user: toPublicUser(user),
      realtorSlug: profile.slug,
      realtorId: profile.id,
      needsEmailVerification: user.status === 'pending_verification',
      redirectTo: `/cliente/${profile.slug}/termos`,
    }
    if (
      user.status === 'pending_verification' &&
      (!isProductionRuntime() || process.env.EXPOSE_OTP_IN_RESPONSE === 'true')
    ) {
      // OTP só em resposta em não-prod
    }

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_EXISTS') {
      return NextResponse.json({ ok: false, error: 'E-mail já cadastrado.' }, { status: 409 })
    }
    throw err
  }
}
