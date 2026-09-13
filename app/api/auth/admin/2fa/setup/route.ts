import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { z } from 'zod'
import { requireAdmin, AuthError } from '@/lib/server/guards'
import { findUserById, updateUserTotp } from '@/lib/server/users'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { rateLimit, clientIp } from '@/lib/server/rate-limit'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { getKvStore } from '@/lib/server/store'
import { peekAdmin2faChallenge } from '@/lib/server/admin-2fa-challenge'
import {
  encryptTotpSecret,
  generateTotpSecret,
  totpUri,
} from '@/lib/server/totp'

const SETUP_TTL_MS = 10 * 60 * 1000

const bodySchema = z.object({
  /** Challenge pós-senha quando ainda não há sessão completa (REQUIRE_ADMIN_2FA). */
  challengeId: z.string().min(16).max(128).optional(),
})

function setupKey(userId: string) {
  return `admin2fa:setup:${userId}`
}

/** Inicia enrollment TOTP — sessão admin OU challengeId pós-login. */
export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const ip = clientIp(request)
  const rl = await rateLimit(`admin-2fa-setup:${ip}`, 10, 60 * 60 * 1000)
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'Muitas tentativas.' }, { status: 429 })
  }

  let json: unknown = {}
  try {
    const text = await request.text()
    if (text) json = JSON.parse(text)
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Dados inválidos' }, { status: 400 })
  }

  try {
    let userId: string | undefined
    if (parsed.data.challengeId) {
      const challenge = await peekAdmin2faChallenge(parsed.data.challengeId)
      if (!challenge) {
        return NextResponse.json(
          { ok: false, error: 'Desafio expirado. Faça login novamente.' },
          { status: 401 }
        )
      }
      userId = challenge.userId
    } else {
      const session = await requireAdmin()
      userId = session.sub!
    }

    const user = await findUserById(userId)
    if (!user) return NextResponse.json({ ok: false, error: 'Usuário não encontrado' }, { status: 404 })

    if (user.role !== 'super_admin' && user.role !== 'admin') {
      return NextResponse.json({ ok: false, error: '2FA disponível para admin/super_admin.' }, { status: 403 })
    }

    const secret = generateTotpSecret()
    await getKvStore().set(
      setupKey(user.id),
      JSON.stringify({ secret, at: Date.now() }),
      SETUP_TTL_MS
    )

    await updateUserTotp(user.id, {
      totpSecretEnc: encryptTotpSecret(secret),
      totpEnabled: false,
    })

    const uri = totpUri(secret, user.email)
    const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 220 })

    await appendSecurityEvent({
      type: 'auth.login.success',
      result: 'ok',
      userId: user.id,
      email: user.email,
      ip,
      realm: 'admin',
      detail: '2fa-setup-started',
    })

    return NextResponse.json({
      ok: true,
      otpauthUrl: uri,
      secret,
      qrDataUrl,
      message: 'Escaneie o QR no autenticador e confirme com um código.',
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status })
    }
    throw e
  }
}
