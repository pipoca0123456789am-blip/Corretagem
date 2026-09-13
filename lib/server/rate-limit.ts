/**
 * Rate limit via SharedKvStore (memória ou Redis/Upstash).
 */

import { getKvStore } from '@/lib/server/store'

interface Bucket {
  count: number
  resetAt: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: true; remaining: number } | { ok: false; retryAfterSec: number }> {
  const kv = getKvStore()
  const now = Date.now()
  const fullKey = `rl:${key}`
  const raw = await kv.get(fullKey)
  let bucket: Bucket | null = null
  if (raw) {
    try {
      bucket = JSON.parse(raw) as Bucket
    } catch {
      bucket = null
    }
  }

  if (!bucket || now > bucket.resetAt) {
    const next: Bucket = { count: 1, resetAt: now + windowMs }
    await kv.set(fullKey, JSON.stringify(next), windowMs)
    return { ok: true, remaining: limit - 1 }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  const ttl = Math.max(1, bucket.resetAt - now)
  await kv.set(fullKey, JSON.stringify(bucket), ttl)
  return { ok: true, remaining: limit - bucket.count }
}

export function clientIp(request: Request): string {
  const h = request.headers
  const vercel = h.get('x-vercel-forwarded-for') || h.get('x-real-ip')
  if (vercel) return vercel.split(',')[0]!.trim()
  const xf = h.get('x-forwarded-for')
  if (xf) return xf.split(',')[0]!.trim()
  return 'unknown'
}
