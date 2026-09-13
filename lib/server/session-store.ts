/**
 * Sessões server-side: JWT curto + linha DB (quando Postgres disponível).
 * create / get / validate / rotate / revoke / revokeAll
 */

import type { Pool } from 'pg'
import type { AuthRealm, UserRole } from '@/lib/server/user-types'
import { SESSION_TTL_SECONDS } from '@/lib/server/secrets'
import { resolveDatabaseUrl } from '@/lib/server/store/postgres-user-store'
import { revokeSession, revokeAllSessionsForUser } from '@/lib/server/session-revocation'

export interface SessionRecord {
  id: string
  userId: string
  realm: AuthRealm
  role: UserRole
  realtorId: number | null
  userAgent?: string | null
  ip?: string | null
  createdAt: string
  expiresAt: string
  revokedAt: string | null
  rotatedFrom: string | null
}

let pool: Pool | null = null
let memorySessions = new Map<string, SessionRecord>()

async function getPool(): Promise<Pool | null> {
  const url = resolveDatabaseUrl()
  if (!url) return null
  if (pool) return pool
  const { Pool: PgPool } = await import('pg')
  pool = new PgPool({
    connectionString: url,
    max: 5,
    ssl: process.env.DATABASE_SSL === 'false' ? undefined : { rejectUnauthorized: false },
  })
  return pool
}

function toIso(v: Date | string | null | undefined): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString()
  return String(v)
}

export async function createSessionRecord(input: {
  sid: string
  userId: string
  realm: AuthRealm
  role: UserRole
  realtorId: number | null
  userAgent?: string | null
  ip?: string | null
  ttlSeconds?: number
  rotatedFrom?: string | null
}): Promise<SessionRecord> {
  const ttl = input.ttlSeconds ?? SESSION_TTL_SECONDS
  const now = new Date()
  const expires = new Date(now.getTime() + ttl * 1000)
  const record: SessionRecord = {
    id: input.sid,
    userId: input.userId,
    realm: input.realm,
    role: input.role,
    realtorId: input.realtorId,
    userAgent: input.userAgent ?? null,
    ip: input.ip ?? null,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    revokedAt: null,
    rotatedFrom: input.rotatedFrom ?? null,
  }

  const pg = await getPool()
  if (pg) {
    try {
      await pg.query(
        `INSERT INTO public.ih_sessions (
           id, user_id, realm, role, realtor_id, user_agent, ip,
           created_at, expires_at, revoked_at, rotated_from
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NULL,$10)`,
        [
          record.id,
          record.userId,
          record.realm,
          record.role,
          record.realtorId,
          record.userAgent,
          record.ip,
          record.createdAt,
          record.expiresAt,
          record.rotatedFrom,
        ]
      )
      return record
    } catch (err) {
      console.warn(
        '[session-store] INSERT ih_sessions falhou; fallback memória.',
        err instanceof Error ? err.message : err
      )
    }
  }

  memorySessions.set(record.id, record)
  return record
}

export async function getSessionRecord(sid: string): Promise<SessionRecord | null> {
  const pg = await getPool()
  if (pg) {
    try {
      const { rows } = await pg.query<{
        id: string
        user_id: string
        realm: string
        role: string
        realtor_id: string | number | null
        user_agent: string | null
        ip: string | null
        created_at: Date | string
        expires_at: Date | string
        revoked_at: Date | string | null
        rotated_from: string | null
      }>(
        `SELECT id, user_id, realm, role, realtor_id, user_agent, ip,
                created_at, expires_at, revoked_at, rotated_from
         FROM public.ih_sessions WHERE id = $1`,
        [sid]
      )
      const row = rows[0]
      if (row) {
        return {
          id: row.id,
          userId: row.user_id,
          realm: row.realm as AuthRealm,
          role: row.role as UserRole,
          realtorId: row.realtor_id == null ? null : Number(row.realtor_id),
          userAgent: row.user_agent,
          ip: row.ip,
          createdAt: toIso(row.created_at) || '',
          expiresAt: toIso(row.expires_at) || '',
          revokedAt: toIso(row.revoked_at),
          rotatedFrom: row.rotated_from,
        }
      }
      // Tabela vazia / sid só em memória (fallback) — continua
    } catch {
      /* fall through memory */
    }
  }
  return memorySessions.get(sid) || null
}

export async function validateSessionRecord(sid: string): Promise<SessionRecord | null> {
  const rec = await getSessionRecord(sid)
  if (!rec) return null
  if (rec.revokedAt) return null
  if (new Date(rec.expiresAt).getTime() <= Date.now()) return null
  return rec
}

export async function revokeSessionRecord(sid: string, userId: string): Promise<void> {
  await revokeSession(userId, sid)
  const pg = await getPool()
  if (pg) {
    try {
      await pg.query(
        `UPDATE public.ih_sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL`,
        [sid]
      )
    } catch {
      /* ignore */
    }
  }
  const mem = memorySessions.get(sid)
  if (mem) {
    memorySessions.set(sid, { ...mem, revokedAt: new Date().toISOString() })
  }
}

export async function revokeAllSessionRecords(userId: string): Promise<void> {
  await revokeAllSessionsForUser(userId)
  const pg = await getPool()
  if (pg) {
    try {
      await pg.query(
        `UPDATE public.ih_sessions SET revoked_at = now()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId]
      )
    } catch {
      /* ignore */
    }
  }
  for (const [id, rec] of memorySessions) {
    if (rec.userId === userId && !rec.revokedAt) {
      memorySessions.set(id, { ...rec, revokedAt: new Date().toISOString() })
    }
  }
}

export async function listSessionsForUser(userId: string): Promise<SessionRecord[]> {
  const pg = await getPool()
  if (pg) {
    try {
      const { rows } = await pg.query<{
        id: string
        user_id: string
        realm: string
        role: string
        realtor_id: string | number | null
        user_agent: string | null
        ip: string | null
        created_at: Date | string
        expires_at: Date | string
        revoked_at: Date | string | null
        rotated_from: string | null
      }>(
        `SELECT id, user_id, realm, role, realtor_id, user_agent, ip,
                created_at, expires_at, revoked_at, rotated_from
         FROM public.ih_sessions WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      )
      return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        realm: row.realm as AuthRealm,
        role: row.role as UserRole,
        realtorId: row.realtor_id == null ? null : Number(row.realtor_id),
        userAgent: row.user_agent,
        ip: row.ip,
        createdAt: toIso(row.created_at) || '',
        expiresAt: toIso(row.expires_at) || '',
        revokedAt: toIso(row.revoked_at),
        rotatedFrom: row.rotated_from,
      }))
    } catch {
      /* fallthrough */
    }
  }
  return [...memorySessions.values()].filter((r) => r.userId === userId)
}

export async function rotateSessionRecord(input: {
  oldSid: string
  newSid: string
  userId: string
  realm: AuthRealm
  role: UserRole
  realtorId: number | null
  userAgent?: string | null
  ip?: string | null
}): Promise<SessionRecord> {
  await revokeSessionRecord(input.oldSid, input.userId)
  return createSessionRecord({
    sid: input.newSid,
    userId: input.userId,
    realm: input.realm,
    role: input.role,
    realtorId: input.realtorId,
    userAgent: input.userAgent,
    ip: input.ip,
    rotatedFrom: input.oldSid,
  })
}

export function __resetSessionStoreForTests() {
  memorySessions = new Map()
  if (pool) {
    void pool.end().catch(() => undefined)
    pool = null
  }
}
