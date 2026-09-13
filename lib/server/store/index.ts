import { Pool } from 'pg'
import type { RevocationStore, SharedKvStore, UserStore } from '@/lib/server/store/types'
import { createFileUserStore } from '@/lib/server/store/file-user-store'
import { createMemoryRevocationStore } from '@/lib/server/store/memory-revocation-store'
import { createMemoryKvStore } from '@/lib/server/store/memory-kv-store'
import {
  createPostgresUserStore,
  resolveDatabaseUrl,
} from '@/lib/server/store/postgres-user-store'
import {
  createServiceSupabaseClient,
  createSupabaseUserStore,
  resolveSupabaseServiceConfig,
} from '@/lib/server/store/supabase-user-store'
import {
  createRedisKvStore,
  createRedisRevocationStore,
  createRedisClientSync,
  hasRedisEnv,
} from '@/lib/server/store/redis-store'
import {
  assertDatabaseAvailableOrDev,
  assertRedisAvailableOrDev,
  isDemoMode,
  isProductionRuntime,
  isSecurityAssertSkipped,
} from '@/lib/server/env'

/**
 * Factory única. Produção: Postgres + Redis obrigatórios (fail-closed).
 * Dev/test: file/memory OK com logs.
 */

let userStore: UserStore | null = null
let revocationStore: RevocationStore | null = null
let kvStore: SharedKvStore | null = null
let pgPool: Pool | null = null

function getOrCreatePool(): Pool | null {
  const url = resolveDatabaseUrl()
  if (!url) return null
  if (pgPool) return pgPool
  pgPool = new Pool({
    connectionString: url,
    max: 5,
    ssl: process.env.DATABASE_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  })
  return pgPool
}

export function getPgPool(): Pool | null {
  return getOrCreatePool()
}

export function getUserStore(): UserStore {
  if (userStore) return userStore

  assertDatabaseAvailableOrDev()

  const pool = getOrCreatePool()
  if (pool) {
    userStore = createPostgresUserStore(pool)
    console.info('[store] User store: Postgres (createPostgresUserStore).')
    return userStore
  }

  const supabase = createServiceSupabaseClient()
  if (supabase && resolveSupabaseServiceConfig()) {
    userStore = createSupabaseUserStore(supabase)
    console.info('[store] User store: Supabase service_role (PostgREST → ih_users).')
    return userStore
  }

  if (isProductionRuntime() && !isSecurityAssertSkipped() && !isDemoMode()) {
    throw new Error(
      '[store] Fail-closed: sem DATABASE_URL nem SUPABASE_SERVICE_ROLE_KEY em produção — sem fallback file/memory.'
    )
  }

  console.warn(
    isDemoMode()
      ? '[store] DEMO_MODE: user store file/memory (efêmero no Vercel).'
      : '[store] Dev/test: user store file/memory (configure DATABASE_URL ou SUPABASE_SERVICE_ROLE_KEY).'
  )
  userStore = createFileUserStore()
  return userStore
}

export function getRevocationStore(): RevocationStore {
  if (revocationStore) return revocationStore

  assertRedisAvailableOrDev()

  if (hasRedisEnv()) {
    const client = createRedisClientSync()
    if (client) {
      console.info('[store] Revogação via Redis/Upstash.')
      revocationStore = createRedisRevocationStore(client)
      return revocationStore
    }
    if (isProductionRuntime() && !isSecurityAssertSkipped()) {
      throw new Error('[store] Fail-closed: Redis env presente mas cliente falhou em produção.')
    }
    console.warn('[store] Redis env presente mas cliente falhou; revogação em memória (dev).')
  } else if (isProductionRuntime() && !isSecurityAssertSkipped() && !isDemoMode()) {
    throw new Error(
      '[store] Fail-closed: Redis/Upstash obrigatório em produção para revogação (sem fallback memória).'
    )
  } else {
    console.warn(
      isDemoMode() ? '[store] DEMO_MODE: revogação em memória.' : '[store] Dev/test: revogação em memória.'
    )
  }

  revocationStore = createMemoryRevocationStore()
  return revocationStore
}

export function getKvStore(): SharedKvStore {
  if (kvStore) return kvStore

  assertRedisAvailableOrDev()

  if (hasRedisEnv()) {
    const client = createRedisClientSync()
    if (client) {
      console.info('[store] KV (rate-limit) via Redis/Upstash.')
      kvStore = createRedisKvStore(client)
      return kvStore
    }
    if (isProductionRuntime() && !isSecurityAssertSkipped()) {
      throw new Error('[store] Fail-closed: Redis env presente mas cliente KV falhou em produção.')
    }
    console.warn('[store] Redis env presente mas cliente falhou; KV em memória (dev).')
  } else if (isProductionRuntime() && !isSecurityAssertSkipped() && !isDemoMode()) {
    throw new Error(
      '[store] Fail-closed: Redis/Upstash obrigatório em produção para rate-limit (sem fallback memória).'
    )
  } else {
    console.warn(
      isDemoMode()
        ? '[store] DEMO_MODE: rate-limit KV em memória.'
        : '[store] Dev/test: rate-limit KV em memória.'
    )
  }

  kvStore = createMemoryKvStore()
  return kvStore
}

/** Reset factories (testes). */
export function __resetStoreSingletonsForTests() {
  userStore = null
  revocationStore = null
  kvStore = null
  if (pgPool) {
    void pgPool.end().catch(() => undefined)
    pgPool = null
  }
}

export type { UserStore, RevocationStore, SharedKvStore, StoreBackend } from '@/lib/server/store/types'
