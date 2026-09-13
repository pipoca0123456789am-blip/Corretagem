import { Redis as UpstashRedis } from '@upstash/redis'
import type { RevocationStore, SharedKvStore, StoreBackend } from '@/lib/server/store/types'
import { hasRedisEnv } from '@/lib/server/store/redis-env'

export { hasRedisEnv }

export type RedisLike = {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>
  del(...keys: string[]): Promise<number>
  sadd(key: string, ...members: string[]): Promise<number>
  sismember(key: string, member: string): Promise<number>
  expire(key: string, seconds: number): Promise<number>
}

const PREFIX = 'ih:'
const REVOKE_TTL_SEC = 60 * 60 * 24 * 14 // 14d

function revAllKey(userId: string) {
  return `${PREFIX}rev:all:${userId}`
}

function revSidKey(userId: string) {
  return `${PREFIX}rev:sid:${userId}`
}

export function createRedisRevocationStore(redis: RedisLike): RevocationStore {
  const backend: StoreBackend = 'redis'
  return {
    backend,
    async revokeAll(userId: string) {
      const at = String(Math.floor(Date.now() / 1000))
      await redis.set(revAllKey(userId), at, 'EX', REVOKE_TTL_SEC)
    },
    async revokeSid(userId: string, sid: string) {
      const key = revSidKey(userId)
      await redis.sadd(key, sid)
      await redis.expire(key, REVOKE_TTL_SEC)
    },
    async isRevoked(input) {
      const sidHit = await redis.sismember(revSidKey(input.userId), input.sid)
      if (sidHit === 1) return true
      const raw = await redis.get(revAllKey(input.userId))
      if (!raw) return false
      const revokedAtSec = Number(raw)
      if (
        Number.isFinite(revokedAtSec) &&
        revokedAtSec > 0 &&
        typeof input.iat === 'number' &&
        input.iat < revokedAtSec
      ) {
        return true
      }
      return false
    },
  }
}

export function createRedisKvStore(redis: RedisLike): SharedKvStore {
  const backend: StoreBackend = 'redis'
  return {
    backend,
    async get(key) {
      const v = await redis.get(`${PREFIX}kv:${key}`)
      return v ?? undefined
    },
    async set(key, value, ttlMs) {
      const full = `${PREFIX}kv:${key}`
      if (typeof ttlMs === 'number' && ttlMs > 0) {
        const sec = Math.max(1, Math.ceil(ttlMs / 1000))
        await redis.set(full, value, 'EX', sec)
      } else {
        await redis.set(full, value)
      }
    },
    async delete(key) {
      await redis.del(`${PREFIX}kv:${key}`)
    },
  }
}

let cachedClient: RedisLike | null | undefined

function wrapUpstash(client: UpstashRedis): RedisLike {
  return {
    async get(key) {
      const v = await client.get<string>(key)
      return v == null ? null : String(v)
    },
    async set(key, value, ...args) {
      if (args[0] === 'EX' && typeof args[1] === 'number') {
        return client.set(key, value, { ex: args[1] })
      }
      return client.set(key, value)
    },
    async del(...keys) {
      if (keys.length === 0) return 0
      const [first, ...rest] = keys
      return client.del(first!, ...rest)
    },
    async sadd(key, ...members) {
      if (members.length === 0) return 0
      const [first, ...rest] = members
      return client.sadd(key, first!, ...rest)
    },
    async sismember(key, member) {
      const hit = await client.sismember(key, member)
      return hit ? 1 : 0
    },
    async expire(key, seconds) {
      return client.expire(key, seconds)
    },
  }
}

/** Cliente Redis síncrono (lazy connect). Reutiliza singleton. */
export function createRedisClientSync(): RedisLike | null {
  if (cachedClient !== undefined) return cachedClient

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (upstashUrl && upstashToken) {
    cachedClient = wrapUpstash(new UpstashRedis({ url: upstashUrl, token: upstashToken }))
    return cachedClient
  }

  const redisUrl = process.env.REDIS_URL?.trim()
  if (redisUrl) {
    // Lazy require: ioredis usa Node streams e não pode ir no bundle de instrumentation/edge.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { default: Redis } = require('ioredis') as typeof import('ioredis')
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: false,
      lazyConnect: true,
    })
    cachedClient = client
    return cachedClient
  }

  cachedClient = null
  return null
}

export function __resetRedisClientForTests() {
  cachedClient = undefined
}
