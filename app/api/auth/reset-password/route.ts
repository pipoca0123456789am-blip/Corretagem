import { NextResponse } from 'next/server'
import { z } from 'zod'
import { assertPasswordPolicy, hashPassword } from '@/lib/server/password'
import { findUserById, updatePasswordHash } from '@/lib/server/users'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { consumePasswordResetToken } from '@/lib/server/password-reset'
import { revokeAllSessionsForUser } from '@/lib/server/session-revocation'
import { clearSessionCookie } from '@/lib/server/session'

const bodySchema = z.object({
  token: z.string().min(16).max(200),
  password: z.string().min(10).max(128),
})

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`password-reset-confirm:${ip}`, 15, 60 * 60 * 1000)
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

  const policy = assertPasswordPolicy(parsed.data.password)
  if (!policy.ok) {
    return NextResponse.json({ ok: false, error: policy.error }, { status: 400 })
  }

  const consumed = consumePasswordResetToken(parsed.data.token)
  if (!consumed.ok) {
    await appendSecurityEvent({
      type: 'auth.password_reset.failed',
      result: 'denied',
      ip,
      detail: consumed.error,
    })
    return NextResponse.json({ ok: false, error: consumed.error }, { status: 400 })
  }

  const user = await findUserById(consumed.userId)
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Link inválido ou expirado.' }, { status: 400 })
  }

  const passwordHash = await hashPassword(parsed.data.password)
  await updatePasswordHash(user.id, passwordHash)
  await revokeAllSessionsForUser(user.id)
  await clearSessionCookie('admin')
  await clearSessionCookie('app')

  await appendSecurityEvent({
    type: 'auth.password_reset.completed',
    result: 'ok',
    userId: user.id,
    email: user.email,
    ip,
  })

  return NextResponse.json({
    ok: true,
    message: 'Senha atualizada. Faça login novamente.',
  })
}
