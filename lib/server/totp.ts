/**
 * TOTP 2FA (super_admin) — otpauth + segredo cifrado com ENCRYPTION_KEY
 * (distinto de AUTH_SECRET).
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
import * as OTPAuth from 'otpauth'
import { getEncryptionKeyMaterial, isProductionRuntime } from '@/lib/server/secrets'

const ISSUER = 'ImóvelHub Admin'
const ALGO = 'aes-256-gcm'

function deriveKey(): Buffer {
  return createHash('sha256').update(getEncryptionKeyMaterial()).digest()
}

export function encryptTotpSecret(plain: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, deriveKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${enc.toString('base64url')}`
}

export function decryptTotpSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('TOTP_SECRET_CORRUPT')
  const decipher = createDecipheriv(ALGO, deriveKey(), Buffer.from(ivB64, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'))
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64url')),
    decipher.final(),
  ])
  return dec.toString('utf8')
}

export function generateTotpSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 })
  return secret.base32
}

export function buildTotp(secretBase32: string, accountName: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountName,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
}

export function totpUri(secretBase32: string, accountName: string): string {
  return buildTotp(secretBase32, accountName).toString()
}

export function verifyTotpCode(secretBase32: string, code: string, accountName = 'user'): boolean {
  const totp = buildTotp(secretBase32, accountName)
  const delta = totp.validate({ token: code.trim(), window: 1 })
  return delta !== null
}

export function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex')
}

/** Gera códigos plaintext (mostrar uma vez) + hashes para persistir. */
export async function generateRecoveryCodes(count = 8): Promise<{
  codes: string[]
  hashes: string[]
}> {
  const codes: string[] = []
  const hashes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = randomBytes(5).toString('hex').toUpperCase()
    codes.push(code)
    hashes.push(hashRecoveryCode(code))
  }
  return { codes, hashes }
}

export async function consumeRecoveryCode(
  code: string,
  hashes: string[]
): Promise<{ ok: true; remaining: string[] } | { ok: false }> {
  const target = hashRecoveryCode(code)
  const idx = hashes.findIndex((h) => h === target)
  if (idx < 0) return { ok: false }
  const remaining = hashes.filter((_, i) => i !== idx)
  return { ok: true, remaining }
}

/** Challenge de login 2FA (curto TTL) — valor em KV. */
export interface Admin2faChallenge {
  userId: string
  email: string
  createdAt: number
  next?: string
}

/**
 * Em produção: REQUIRE_ADMIN_2FA default ON para super_admin
 * (pode desligar só com REQUIRE_ADMIN_2FA=false explícito — não recomendado).
 */
export function isAdmin2faEnforcementEnabled(): boolean {
  if (process.env.REQUIRE_ADMIN_2FA === 'false') return false
  if (process.env.REQUIRE_ADMIN_2FA === 'true') return true
  return isProductionRuntime()
}

export function shouldRequireAdmin2fa(user: {
  role: string
  totpEnabled?: boolean
}): boolean {
  if (user.totpEnabled) return true
  if (isAdmin2faEnforcementEnabled() && (user.role === 'super_admin' || user.role === 'admin')) {
    return true
  }
  return false
}

/** Não logar códigos TOTP. */
export function safeTotpLog(code: string): string {
  if (isProductionRuntime()) return '[redacted]'
  return code.length >= 2 ? `${code[0]}****${code[code.length - 1]}` : '****'
}
