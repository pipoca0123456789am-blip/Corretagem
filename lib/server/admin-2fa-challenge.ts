/**
 * Challenges de login admin 2FA (password OK → pending TOTP).
 * Usa SharedKvStore (memória/Redis).
 */

import { randomBytes } from 'crypto'
import { getKvStore } from '@/lib/server/store'
import type { Admin2faChallenge } from '@/lib/server/totp'

const TTL_MS = 5 * 60 * 1000

function key(id: string) {
  return `admin2fa:challenge:${id}`
}

export async function createAdmin2faChallenge(
  data: Omit<Admin2faChallenge, 'createdAt'>
): Promise<string> {
  const id = randomBytes(24).toString('hex')
  const payload: Admin2faChallenge = { ...data, createdAt: Date.now() }
  await getKvStore().set(key(id), JSON.stringify(payload), TTL_MS)
  return id
}

export async function consumeAdmin2faChallenge(
  challengeId: string
): Promise<Admin2faChallenge | null> {
  const kv = getKvStore()
  const k = key(challengeId.trim())
  const raw = await kv.get(k)
  if (!raw) return null
  await kv.delete(k)
  try {
    const parsed = JSON.parse(raw) as Admin2faChallenge
    if (Date.now() - parsed.createdAt > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

export async function peekAdmin2faChallenge(
  challengeId: string
): Promise<Admin2faChallenge | null> {
  const raw = await getKvStore().get(key(challengeId.trim()))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Admin2faChallenge
    if (Date.now() - parsed.createdAt > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}
