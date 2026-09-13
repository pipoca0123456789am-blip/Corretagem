import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findUserById, toPublicUser, updateUserTotp } from '@/lib/server/users'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { safeInternalPath } from '@/lib/server/safe-redirect'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { consumeAdmin2faChallenge } from '@/lib/server/admin-2fa-challenge'
import {
  consumeRecoveryCode,
  decryptTotpSecret,
  verifyTotpCode,
} from '@/lib/server/totp'

const bodySchema = z.object({
  challengeId: z.string().min(16).max(128),
  code: z.string().min(6).max(32),
  recovery: z.boolean().optional(),
})

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`admin-2fa-verify:${ip}`, 20, 15 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'Muitas tentativas.' }, { status: 429 })
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

  const challenge = await consumeAdmin2faChallenge(parsed.data.challengeId)
  if (!challenge) {
    return NextResponse.json(
      { ok: false, error: 'Desafio 2FA expirado. Faça login novamente.' },
      { status: 401 }
    )
  }

  const user = await findUserById(challenge.userId)
  if (!user || !user.totpEnabled || !user.totpSecretEnc) {
    return NextResponse.json({ ok: false, error: '2FA não configurado.' }, { status: 400 })
  }

  let ok = false
  if (parsed.data.recovery) {
    const consumed = await consumeRecoveryCode(
      parsed.data.code,
      user.totpRecoveryHashes || []
    )
    if (consumed.ok) {
      ok = true
      await updateUserTotp(user.id, { totpRecoveryHashes: consumed.remaining })
    }
  } else {
    try {
      const secret = decryptTotpSecret(user.totpSecretEnc)
      ok = verifyTotpCode(secret, parsed.data.code, user.email)
    } catch {
      ok = false
    }
  }

  if (!ok) {
    await appendSecurityEvent({
      type: 'auth.login.failed',
      result: 'denied',
      userId: user.id,
      email: user.email,
      ip,
      realm: 'admin',
      detail: '2fa-invalid',
    })
    return NextResponse.json({ ok: false, error: 'Código 2FA inválido.' }, { status: 401 })
  }

  const { token, maxAge } = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    realm: 'admin',
    realtorId: user.realtorId,
  })
  await setSessionCookie('admin', token, maxAge)

  await appendSecurityEvent({
    type: 'auth.login.success',
    result: 'ok',
    userId: user.id,
    email: user.email,
    ip,
    realm: 'admin',
    detail: '2fa-ok',
  })

  return NextResponse.json({
    ok: true,
    user: toPublicUser(user),
    redirectTo: safeInternalPath(challenge.next, '/paineladmin'),
  })
}
