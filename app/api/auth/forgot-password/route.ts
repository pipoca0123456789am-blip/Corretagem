import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserByEmail } from '@/lib/server/users'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import {
  createPasswordResetToken,
  RESET_GENERIC_MESSAGE,
  shouldExposeResetToken,
} from '@/lib/server/password-reset'
import { sendPasswordResetEmail } from '@/lib/server/email'

const bodySchema = z.object({
  email: z.string().email(),
})

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`password-reset:${ip}`, 8, 60 * 60 * 1000)
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
    // Anti-enumeração mesmo com e-mail inválido no formato
    return NextResponse.json({ ok: true, message: RESET_GENERIC_MESSAGE })
  }

  const user = await findUserByEmail(parsed.data.email)
  const payload: Record<string, unknown> = { ok: true, message: RESET_GENERIC_MESSAGE }

  if (user && user.status !== 'inativo') {
    const { token } = createPasswordResetToken(user.id, user.email)
    const origin = new URL(request.url).origin
    const resetPath = `/reset-password?token=${token}`
    await sendPasswordResetEmail(user.email, `${origin}${resetPath}`, token)
    await appendSecurityEvent({
      type: 'auth.password_reset.requested',
      result: 'ok',
      userId: user.id,
      email: user.email,
      ip,
    })
    if (shouldExposeResetToken()) {
      payload.devResetToken = token
      payload.devResetPath = resetPath
    }
  } else {
    await appendSecurityEvent({
      type: 'auth.password_reset.requested',
      result: 'ok',
      email: parsed.data.email,
      ip,
      detail: 'unknown-or-inactive',
    })
  }

  return NextResponse.json(payload)
}
