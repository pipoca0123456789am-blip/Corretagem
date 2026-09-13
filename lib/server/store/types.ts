import type { ServerUser } from '@/lib/server/user-types'

/**
 * Abstração de persistência autenticada.
 *
 * DEV: file/memory (`file-user-store`).
 * PROD multi-instância: DATABASE_URL / SUPABASE_DB_URL → Postgres;
 * UPSTASH_* / REDIS_URL → Redis (revogação + rate-limit).
 */

export type StoreBackend = 'file' | 'memory' | 'postgres' | 'redis'

export interface UserStore {
  readonly backend: StoreBackend
  list(): Promise<ServerUser[]>
  save(users: ServerUser[]): Promise<void>
}

export interface RevocationEntry {
  revokedAtSec: number
  sids: string[]
}

export interface RevocationStore {
  readonly backend: StoreBackend
  revokeAll(userId: string): Promise<void>
  revokeSid(userId: string, sid: string): Promise<void>
  isRevoked(input: { userId: string; sid: string; iat?: number }): Promise<boolean>
}

export interface SharedKvStore {
  readonly backend: StoreBackend
  get(key: string): Promise<string | undefined>
  set(key: string, value: string, ttlMs?: number): Promise<void>
  delete(key: string): Promise<void>
}
