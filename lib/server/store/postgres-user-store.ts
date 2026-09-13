import type { Pool } from 'pg'
import type { ServerUser, UserRole, UserStatus } from '@/lib/server/user-types'
import type { StoreBackend, UserStore } from '@/lib/server/store/types'

interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
  role: string
  status: string
  realtor_id: string | number | null
  email_verified_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
  totp_secret_enc: string | null
  totp_enabled: boolean | null
  totp_recovery_hashes: string[] | null
}

function toIso(v: Date | string | null | undefined): string | null {
  if (v == null) return null
  if (v instanceof Date) return v.toISOString()
  return String(v)
}

function rowToUser(row: UserRow): ServerUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    realtorId: row.realtor_id == null ? null : Number(row.realtor_id),
    emailVerifiedAt: toIso(row.email_verified_at),
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    updatedAt: toIso(row.updated_at) || new Date().toISOString(),
    totpSecretEnc: row.totp_secret_enc ?? null,
    totpEnabled: Boolean(row.totp_enabled),
    totpRecoveryHashes: Array.isArray(row.totp_recovery_hashes) ? row.totp_recovery_hashes : [],
  }
}

/**
 * Adapter Postgres para `ih_users`.
 * Ativa só com DATABASE_URL / SUPABASE_DB_URL / IMOVELHUB_DATABASE_URL.
 * Não executa DROP/TRUNCATE — apenas SELECT + UPSERT.
 */
export function createPostgresUserStore(pool: Pool): UserStore {
  const backend: StoreBackend = 'postgres'

  return {
    backend,
    async list() {
      const { rows } = await pool.query<UserRow>(
        `SELECT id, name, email, password_hash, role, status, realtor_id,
                email_verified_at, created_at, updated_at,
                totp_secret_enc, totp_enabled, totp_recovery_hashes
         FROM public.ih_users
         ORDER BY created_at ASC`
      )
      return rows.map(rowToUser)
    },
    async save(users: ServerUser[]) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        for (const u of users) {
          await client.query(
            `INSERT INTO public.ih_users (
               id, name, email, password_hash, role, status, realtor_id,
               email_verified_at, created_at, updated_at,
               totp_secret_enc, totp_enabled, totp_recovery_hashes
             ) VALUES (
               $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
             )
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               email = EXCLUDED.email,
               password_hash = EXCLUDED.password_hash,
               role = EXCLUDED.role,
               status = EXCLUDED.status,
               realtor_id = EXCLUDED.realtor_id,
               email_verified_at = EXCLUDED.email_verified_at,
               updated_at = EXCLUDED.updated_at,
               totp_secret_enc = EXCLUDED.totp_secret_enc,
               totp_enabled = EXCLUDED.totp_enabled,
               totp_recovery_hashes = EXCLUDED.totp_recovery_hashes`,
            [
              u.id,
              u.name,
              u.email,
              u.passwordHash,
              u.role,
              u.status,
              u.realtorId,
              u.emailVerifiedAt,
              u.createdAt,
              u.updatedAt,
              u.totpSecretEnc ?? null,
              Boolean(u.totpEnabled),
              u.totpRecoveryHashes ?? [],
            ]
          )
        }
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      } finally {
        client.release()
      }
    },
  }
}

export function resolveDatabaseUrl(): string | undefined {
  // Prefer alias explícito do produto para não colidir com outro schema Supabase no mesmo ambiente.
  const url =
    process.env.IMOVELHUB_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.SUPABASE_DB_URL?.trim()
  return url || undefined
}

/** Compat testes — pool vive em store/index. */
export function __resetPostgresPoolForTests() {
  // no-op; use __resetStoreSingletonsForTests
}
