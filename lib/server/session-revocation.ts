/**
 * Revogação de sessões via abstração de store.
 * Residual HIGH em multi-instância sem Redis compartilhado.
 */

import { getRevocationStore } from '@/lib/server/store'

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await getRevocationStore().revokeAll(userId)
}

export async function revokeSession(userId: string, sid: string): Promise<void> {
  await getRevocationStore().revokeSid(userId, sid)
}

export async function isSessionRevoked(input: {
  userId: string
  sid: string
  iat?: number
}): Promise<boolean> {
  return getRevocationStore().isRevoked(input)
}
