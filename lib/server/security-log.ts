import { promises as fs } from 'fs'
import path from 'path'
import { getPgPool } from '@/lib/server/store'
import { isProductionRuntime } from '@/lib/server/secrets'

export type SecurityEventType =
  | 'auth.login.success'
  | 'auth.login.failed'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.otp.sent'
  | 'auth.otp.verified'
  | 'auth.otp.failed'
  | 'auth.password_reset.requested'
  | 'auth.password_reset.completed'
  | 'auth.password_reset.failed'
  | 'auth.permission_denied'
  | 'security.rate_limited'
  | 'security.session_forged_blocked'

export interface SecurityEvent {
  id: string
  type: SecurityEventType
  at: string
  userId?: string
  email?: string
  realm?: string
  ip?: string
  userAgent?: string
  detail?: string
  result: 'ok' | 'denied' | 'error'
}

const LOG_FILE = path.join(process.cwd(), 'data', 'security-events.jsonl')

/** Append-only security log → Postgres quando disponível; senão arquivo local. */
export async function appendSecurityEvent(
  event: Omit<SecurityEvent, 'id' | 'at'> & { at?: string }
): Promise<void> {
  const entry: SecurityEvent = {
    id: crypto.randomUUID(),
    at: event.at || new Date().toISOString(),
    ...event,
  }

  const pool = getPgPool()
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO public.ih_security_events (
           id, type, at, user_id, email, realm, ip, user_agent, detail, result, payload
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`,
        [
          entry.id,
          entry.type,
          entry.at,
          entry.userId ?? null,
          entry.email ?? null,
          entry.realm ?? null,
          entry.ip ?? null,
          entry.userAgent ?? null,
          entry.detail ?? null,
          entry.result,
          JSON.stringify({}),
        ]
      )
      return
    } catch (err) {
      if (isProductionRuntime()) {
        console.error('[security-log] Postgres append falhou', entry.type, err)
        // Não quebrar auth; ainda tenta arquivo/console
      }
    }
  }

  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true })
    await fs.appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8')
  } catch {
    console.error('[security-log]', entry.type, entry.result)
  }
}
