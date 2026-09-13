import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyOtp, createOtp } from '@/lib/server/otp'
import { activateUser, findUserByEmail, toPublicUser } from '@/lib/server/users'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { isProductionRuntime } from '@/lib/server/secrets'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { sendOtpEmail } from '@/lib/server/email'

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
})

const resendSchema = z.object({
  email: z.string().email(),
  action: z.literal('resend'),
})

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`otp:${ip}`, 30, 15 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'Muitas tentativas.' }, { status: 429 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 })
  }

  const resend = resendSchema.safeParse(json)
  if (resend.success) {
    const user = await findUserByEmail(resend.data.email)
    if (!user || user.status !== 'pending_verification') {
      return NextResponse.json({
        ok: true,
        message: 'Se houver cadastro pendente, reenviamos o código.',
      })
    }
    const otp = createOtp(user.id, user.email)
    if ('error' in otp) {
      return NextResponse.json({ ok: false, error: otp.error }, { status: 429 })
    }
    await appendSecurityEvent({
      type: 'auth.otp.sent',
      result: 'ok',
      userId: user.id,
      email: user.email,
      ip,
    })
    await sendOtpEmail(user.email, otp.code)
    const payload: Record<string, unknown> = { ok: true, message: 'Código reenviado.' }
    if (!isProductionRuntime() || process.env.EXPOSE_OTP_IN_RESPONSE === 'true') {
      payload.devOtp = otp.code
    }
    return NextResponse.json(payload)
  }

  const parsed = verifySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Dados inválidos' }, { status: 400 })
  }

  const result = verifyOtp(parsed.data.email, parsed.data.code)
  if (!result.ok) {
    await appendSecurityEvent({
      type: 'auth.otp.failed',
      result: 'denied',
      email: parsed.data.email,
      ip,
      detail: result.error,
    })
    return NextResponse.json({ ok: false, error: result.error }, { status: 401 })
  }

  const user = await activateUser(result.userId)
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Usuário não encontrado.' }, { status: 404 })
  }

  const { token, maxAge } = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    realm: 'app',
    realtorId: user.realtorId,
  })
  await setSessionCookie('app', token, maxAge)

  await appendSecurityEvent({
    type: 'auth.otp.verified',
    result: 'ok',
    userId: user.id,
    email: user.email,
    ip,
  })

  return NextResponse.json({
    ok: true,
    user: toPublicUser(user),
    redirectTo: '/onboarding',
  })
}
