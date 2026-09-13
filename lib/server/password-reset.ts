import { createHash, randomBytes } from 'crypto'
import { isProductionRuntime } from '@/lib/server/secrets'

export interface ResetTokenRecord {
  userId: string
  email: string
  tokenHash: string
  expiresAt: number
  usedAt: number | null
}

const store = new Map<string, ResetTokenRecord>()

const TTL_MS = 30 * 60 * 1000

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function emailKey(email: string) {
  return email.trim().toLowerCase()
}

/** Cria token de uso único (retorna plaintext só para envio). */
export function createPasswordResetToken(
  userId: string,
  email: string
): { token: string; expiresAt: number } {
  const token = randomBytes(32).toString('hex')
  const k = emailKey(email)
  for (const [id, rec] of store) {
    if (rec.email === k && !rec.usedAt) store.delete(id)
  }
  const id = crypto.randomUUID()
  const expiresAt = Date.now() + TTL_MS
  store.set(id, {
    userId,
    email: k,
    tokenHash: hashToken(token),
    expiresAt,
    usedAt: null,
  })
  return { token, expiresAt }
}

export function consumePasswordResetToken(
  token: string
): { ok: true; userId: string; email: string } | { ok: false; error: string } {
  const hash = hashToken(token.trim())
  const now = Date.now()
  for (const [id, rec] of store) {
    if (rec.tokenHash !== hash) continue
    if (rec.usedAt) {
      return { ok: false, error: 'Link já utilizado.' }
    }
    if (now > rec.expiresAt) {
      store.delete(id)
      return { ok: false, error: 'Link expirado. Solicite um novo.' }
    }
    rec.usedAt = now
    store.delete(id)
    return { ok: true, userId: rec.userId, email: rec.email }
  }
  return { ok: false, error: 'Link inválido ou expirado.' }
}

/** Mensagem genérica anti-enumeração. */
export const RESET_GENERIC_MESSAGE =
  'Se o e-mail estiver cadastrado, enviaremos instruções de recuperação.'

export function shouldExposeResetToken(): boolean {
  return !isProductionRuntime() || process.env.EXPOSE_OTP_IN_RESPONSE === 'true'
}
