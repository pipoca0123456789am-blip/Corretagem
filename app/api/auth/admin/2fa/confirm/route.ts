import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, AuthError } from '@/lib/server/guards'
import { findUserById, updateUserTotp, toPublicUser } from '@/lib/server/users'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { getKvStore } from '@/lib/server/store'
import { consumeAdmin2faChallenge, peekAdmin2faChallenge } from '@/lib/server/admin-2fa-challenge'
import { createSessionToken, setSessionCookie } from '@/lib/server/session'
import { safeInternalPath } from '@/lib/server/safe-redirect'
import {
  decryptTotpSecret,
  generateRecoveryCodes,
  verifyTotpCode,
} from '@/lib/server/totp'

const bodySchema = z.object({
  code: z.string().min(6).max(12),
  challengeId: z.string().min(16).max(128).optional(),
})

function setupKey(userId: string) {
  return `admin2fa:setup:${userId}`
}

/** Confirma enrollment; com challengeId emite sessão completa após ativar 2FA. */
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`admin-2fa-confirm:${ip}`, 20, 15 * 60 * 1000)
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
    return NextResponse.json({ ok: false, error: 'Código inválido' }, { status: 400 })
  }

  try {
    let userId: string | undefined
    let challengeNext: string | undefined
    let consumeChallenge = false

    if (parsed.data.challengeId) {
      const challenge = await peekAdmin2faChallenge(parsed.data.challengeId)
      if (!challenge) {
        return NextResponse.json(
          { ok: false, error: 'Desafio expirado. Faça login novamente.' },
          { status: 401 }
        )
      }
      userId = challenge.userId
      challengeNext = challenge.next
      consumeChallenge = true
    } else {
      const session = await requireAdmin()
      userId = session.sub!
    }

    const user = await findUserById(userId)
    if (!user?.totpSecretEnc) {
      return NextResponse.json(
        { ok: false, error: 'Inicie o setup 2FA primeiro.' },
        { status: 400 }
      )
    }

    let secret: string
    try {
      secret = decryptTotpSecret(user.totpSecretEnc)
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Segredo 2FA corrompido. Refaça o setup.' },
        { status: 400 }
      )
    }

    if (!verifyTotpCode(secret, parsed.data.code, user.email)) {
      await appendSecurityEvent({
        type: 'auth.login.failed',
        result: 'denied',
        userId: user.id,
        email: user.email,
        ip,
        realm: 'admin',
        detail: '2fa-confirm-invalid',
      })
      return NextResponse.json({ ok: false, error: 'Código inválido.' }, { status: 401 })
    }

    const { codes, hashes } = await generateRecoveryCodes(8)
    await updateUserTotp(user.id, {
      totpEnabled: true,
      totpRecoveryHashes: hashes,
    })
    await getKvStore().delete(setupKey(user.id))

    if (consumeChallenge && parsed.data.challengeId) {
      await consumeAdmin2faChallenge(parsed.data.challengeId)
      const { token, maxAge } = await createSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        realm: 'admin',
        realtorId: user.realtorId,
        ip,
      })
      await setSessionCookie('admin', token, maxAge)
    }

    await appendSecurityEvent({
      type: 'auth.login.success',
      result: 'ok',
      userId: user.id,
      email: user.email,
      ip,
      realm: 'admin',
      detail: '2fa-enabled',
    })

    return NextResponse.json({
      ok: true,
      recoveryCodes: codes,
      user: toPublicUser({ ...user, totpEnabled: true }),
      redirectTo: safeInternalPath(challengeNext, '/paineladmin'),
      message: '2FA ativado. Guarde os códigos de recuperação — não serão exibidos novamente.',
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status })
    }
    throw e
  }
}
