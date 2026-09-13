import type { RevocationStore, StoreBackend } from '@/lib/server/store/types'
import { isProductionRuntime } from '@/lib/server/secrets'

interface Entry {
  revokedAtSec: number
  sids: Set<string>
}

const byUser = new Map<string, Entry>()
let warned = false

function warnOnce() {
  if (warned || !isProductionRuntime()) return
  warned = true
  console.warn(
    '[store:revocation] Revogação em memória por processo. ' +
      'Configure UPSTASH_REDIS_REST_URL+TOKEN ou REDIS_URL para multi-instância.'
  )
}

export function createMemoryRevocationStore(): RevocationStore {
  const backend: StoreBackend = 'memory'
  return {
    backend,
    async revokeAll(userId: string) {
      warnOnce()
      const existing = byUser.get(userId)
      const sids = existing?.sids ?? new Set<string>()
      byUser.set(userId, {
        revokedAtSec: Math.floor(Date.now() / 1000),
        sids,
      })
    },
    async revokeSid(userId: string, sid: string) {
      warnOnce()
      const existing = byUser.get(userId) || { revokedAtSec: 0, sids: new Set<string>() }
      existing.sids.add(sid)
      byUser.set(userId, existing)
    },
    async isRevoked(input) {
      const entry = byUser.get(input.userId)
      if (!entry) return false
      if (entry.sids.has(input.sid)) return true
      if (
        entry.revokedAtSec > 0 &&
        typeof input.iat === 'number' &&
        input.iat < entry.revokedAtSec
      ) {
        return true
      }
      return false
    },
  }
}

export function __resetRevocationStoreForTests() {
  byUser.clear()
  warned = false
}
