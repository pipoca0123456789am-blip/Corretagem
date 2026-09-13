/** Detecção de env Redis sem importar ioredis (evita bundling Edge/webpack). */

export function hasRedisEnv(): boolean {
  const upstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim()) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN?.trim())
  return upstash || Boolean(process.env.REDIS_URL?.trim())
}
