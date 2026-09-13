import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { ServerUser, UserRole, UserStatus } from '@/lib/server/user-types'
import type { StoreBackend, UserStore } from '@/lib/server/store/types'

interface IhUserRow {
  id: string
  name: string
  email: string
  password_hash: string
  role: string
  status: string
  realtor_id: number | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
  totp_secret_enc: string | null
  totp_enabled: boolean | null
  totp_recovery_hashes: string[] | null
}

function rowToUser(row: IhUserRow): ServerUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    status: row.status as UserStatus,
    realtorId: row.realtor_id == null ? null : Number(row.realtor_id),
    emailVerifiedAt: row.email_verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totpSecretEnc: row.totp_secret_enc ?? null,
    totpEnabled: Boolean(row.totp_enabled),
    totpRecoveryHashes: Array.isArray(row.totp_recovery_hashes) ? row.totp_recovery_hashes : [],
  }
}

function userToRow(u: ServerUser): IhUserRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    password_hash: u.passwordHash,
    role: u.role,
    status: u.status,
    realtor_id: u.realtorId,
    email_verified_at: u.emailVerifiedAt,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
    totp_secret_enc: u.totpSecretEnc ?? null,
    totp_enabled: Boolean(u.totpEnabled),
    totp_recovery_hashes: u.totpRecoveryHashes ?? [],
  }
}

export function resolveSupabaseServiceConfig(): { url: string; serviceKey: string } | null {
  const url = (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ''
  ).replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
  if (!url || !serviceKey) return null
  return { url, serviceKey }
}

export function createServiceSupabaseClient(): SupabaseClient | null {
  const cfg = resolveSupabaseServiceConfig()
  if (!cfg) return null
  return createClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * User store via PostgREST + service_role (bypassa RLS).
 * Permite rodar sem DATABASE_URL quando só há keys Supabase.
 */
export function createSupabaseUserStore(client: SupabaseClient): UserStore {
  const backend: StoreBackend = 'postgres'

  return {
    backend,
    async list() {
      const { data, error } = await client
        .from('ih_users')
        .select(
          'id,name,email,password_hash,role,status,realtor_id,email_verified_at,created_at,updated_at,totp_secret_enc,totp_enabled,totp_recovery_hashes'
        )
        .order('created_at', { ascending: true })

      if (error) throw new Error(`[supabase-user-store] list: ${error.message}`)
      return (data as IhUserRow[] | null)?.map(rowToUser) ?? []
    },
    async save(users: ServerUser[]) {
      if (users.length === 0) return
      const rows = users.map(userToRow)
      const { error } = await client.from('ih_users').upsert(rows, { onConflict: 'id' })
      if (error) throw new Error(`[supabase-user-store] save: ${error.message}`)
    },
  }
}
