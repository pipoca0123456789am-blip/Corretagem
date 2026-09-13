import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertPasswordPolicy, hashPassword } from '@/lib/server/password'
import { createPendingRealtor, findUserByEmail, toPublicUser } from '@/lib/server/users'
import { createOtp } from '@/lib/server/otp'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { isProductionRuntime } from '@/lib/server/secrets'
import { isDemoMode } from '@/lib/server/env'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { sendOtpEmail } from '@/lib/server/email'

const bodySchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(10).max(128),
})

export async function POST(request: Request) {
  try {
    return await handleRegister(request)
  } catch (err) {
    console.error('[auth/register]', err)
    return NextResponse.json(
      {
        ok: false,
        error:
          'Cadastro temporariamente indisponível. Verifique a configuração do servidor (auth/database).',
      },
      { status: 503 }
    )
  }
}

async function handleRegister(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`register:${ip}`, 8, 60 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Muitas tentativas de cadastro. Tente mais tarde.' },
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

  const policy = assertPasswordPolicy(parsed.data.password)
  if (!policy.ok) {
    return NextResponse.json({ ok: false, error: policy.error }, { status: 400 })
  }

  const existing = await findUserByEmail(parsed.data.email)
  if (existing) {
    // Anti-enumeração: mesma mensagem
    return NextResponse.json({
      ok: true,
      pendingVerification: true,
      message: 'Se o e-mail for válido, enviaremos um código de verificação.',
    })
  }

  const passwordHash = await hashPassword(parsed.data.password)
  let user
  try {
    user = await createPendingRealtor({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      passwordHash,
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_EXISTS') {
      return NextResponse.json({
        ok: true,
        pendingVerification: true,
        message: 'Se o e-mail for válido, enviaremos um código de verificação.',
      })
    }
    throw e
  }

  const otp = createOtp(user.id, user.email)
  if ('error' in otp) {
    return NextResponse.json({ ok: false, error: otp.error }, { status: 429 })
  }

  await appendSecurityEvent({
    type: 'auth.register',
    result: 'ok',
    userId: user.id,
    email: user.email,
    ip,
  })

  const sent = await sendOtpEmail(user.email, otp.code)
  await appendSecurityEvent({
    type: 'auth.otp.sent',
    result: sent.ok ? 'ok' : 'error',
    userId: user.id,
    email: user.email,
    ip,
    detail: sent.ok ? undefined : sent.error || 'email-not-sent',
  })

  const payload: Record<string, unknown> = {
    ok: true,
    pendingVerification: true,
    email: user.email,
    user: toPublicUser(user),
    message: sent.ok
      ? 'Enviamos um código de verificação para o seu e-mail.'
      : 'Conta criada em pending_verification. E-mail não enviado (provedor ausente/falhou) — configure Resend em produção.',
  }
  if (!isProductionRuntime() || process.env.EXPOSE_OTP_IN_RESPONSE === 'true' || isDemoMode()) {
    payload.devOtp = otp.code
  }

  return NextResponse.json(payload)
}
