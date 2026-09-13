/**
 * Audit logs append-only (domínio). Sem API de update/delete.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { getPgPool } from '@/lib/server/store'
import { isProductionRuntime } from '@/lib/server/secrets'

export interface AuditLogEntry {
  id: string
  at: string
  actorUserId?: string
  actorRole?: string
  action: string
  resourceType: string
  resourceId?: string
  tenantRealtorId?: number | null
  ip?: string
  detail?: string
  metadata?: Record<string, unknown>
}

const LOG_FILE = path.join(process.cwd(), 'data', 'audit-logs.jsonl')

export async function appendAuditLog(
  input: Omit<AuditLogEntry, 'id' | 'at'> & { at?: string }
): Promise<void> {
  const entry: AuditLogEntry = {
    id: crypto.randomUUID(),
    at: input.at || new Date().toISOString(),
    ...input,
  }

  const pool = getPgPool()
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO public.ih_audit_logs (
           id, at, actor_user_id, actor_role, action, resource_type, resource_id,
           tenant_realtor_id, ip, detail, metadata
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`,
        [
          entry.id,
          entry.at,
          entry.actorUserId ?? null,
          entry.actorRole ?? null,
          entry.action,
          entry.resourceType,
          entry.resourceId ?? null,
          entry.tenantRealtorId ?? null,
          entry.ip ?? null,
          entry.detail ?? null,
          JSON.stringify(entry.metadata ?? {}),
        ]
      )
      return
    } catch (err) {
      if (isProductionRuntime()) {
        console.error('[audit-log] Postgres append falhou', entry.action, err)
      }
    }
  }

  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true })
    await fs.appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8')
  } catch {
    console.error('[audit-log]', entry.action, entry.resourceType)
  }
}
