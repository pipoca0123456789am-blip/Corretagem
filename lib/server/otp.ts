import { createHash, randomInt } from 'crypto'

interface OtpRecord {
  userId: string
  email: string
  codeHash: string
  attempts: number
  expiresAt: number
  lastSentAt: number
}

const store = new Map<string, OtpRecord>()

const TTL_MS = 10 * 60 * 1000
const COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

function key(email: string) {
  return email.trim().toLowerCase()
}

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export function generateOtpCode(): string {
  return String(randomInt(100000, 999999))
}

export function createOtp(userId: string, email: string): { code: string; cooldownMs: number } | { error: string } {
  const k = key(email)
  const existing = store.get(k)
  const now = Date.now()
  if (existing && now - existing.lastSentAt < COOLDOWN_MS) {
    return { error: 'Aguarde antes de reenviar o código.' }
  }
  const code = generateOtpCode()
  store.set(k, {
    userId,
    email: k,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: now + TTL_MS,
    lastSentAt: now,
  })
  return { code, cooldownMs: COOLDOWN_MS }
}

export function verifyOtp(
  email: string,
  code: string
): { ok: true; userId: string } | { ok: false; error: string } {
  const k = key(email)
  const rec = store.get(k)
  if (!rec) return { ok: false, error: 'Código inválido ou expirado.' }
  if (Date.now() > rec.expiresAt) {
    store.delete(k)
    return { ok: false, error: 'Código expirado. Solicite um novo.' }
  }
  if (rec.attempts >= MAX_ATTEMPTS) {
    store.delete(k)
    return { ok: false, error: 'Muitas tentativas. Solicite um novo código.' }
  }
  rec.attempts += 1
  if (rec.codeHash !== hashCode(code.trim())) {
    return { ok: false, error: 'Código inválido.' }
  }
  store.delete(k)
  return { ok: true, userId: rec.userId }
}
