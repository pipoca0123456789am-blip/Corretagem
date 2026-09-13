import bcrypt from 'bcryptjs'
import { z } from 'zod'

const BCRYPT_ROUNDS = 12

const COMMON = new Set(
  [
    'password',
    '123456',
    '12345678',
    '1234567890',
    'qwerty',
    'abc123',
    'senha',
    'senha123',
    'admin',
    'admin123',
    'password1',
    'iloveyou',
  ].map((s) => s.toLowerCase())
)

export const passwordSchema = z
  .string()
  .min(10, 'A senha deve ter pelo menos 10 caracteres')
  .max(128, 'Senha muito longa')
  .refine((v) => !COMMON.has(v.toLowerCase()), 'Senha muito comum')
  .refine((v) => !/^\d+$/.test(v), 'Senha não pode ser só números')

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  if (!passwordHash || !plain) return false
  return bcrypt.compare(plain, passwordHash)
}

export function assertPasswordPolicy(plain: string): { ok: true } | { ok: false; error: string } {
  const parsed = passwordSchema.safeParse(plain)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Senha inválida' }
  }
  return { ok: true }
}
