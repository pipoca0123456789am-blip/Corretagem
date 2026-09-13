import type { SharedKvStore, StoreBackend } from '@/lib/server/store/types'
import { isProductionRuntime } from '@/lib/server/secrets'

interface Entry {
  value: string
  expiresAt: number | null
}

const map = new Map<string, Entry>()
let warned = false

function warnOnce() {
  if (warned || !isProductionRuntime()) return
  warned = true
  console.warn(
    '[store:kv] Rate-limit/OTP KV em memória por processo. ' +
      'Configure UPSTASH_REDIS_REST_URL+TOKEN ou REDIS_URL para multi-instância.'
  )
}

function prune(key: string, entry: Entry | undefined): string | undefined {
  if (!entry) return undefined
  if (entry.expiresAt != null && Date.now() > entry.expiresAt) {
    map.delete(key)
    return undefined
  }
  return entry.value
}

export function createMemoryKvStore(): SharedKvStore {
  const backend: StoreBackend = 'memory'
  return {
    backend,
    async get(key) {
      warnOnce()
      return prune(key, map.get(key))
    },
    async set(key, value, ttlMs) {
      warnOnce()
      map.set(key, {
        value,
        expiresAt: typeof ttlMs === 'number' ? Date.now() + ttlMs : null,
      })
    },
    async delete(key) {
      map.delete(key)
    },
  }
}

export function __resetMemoryKvForTests() {
  map.clear()
  warned = false
}
