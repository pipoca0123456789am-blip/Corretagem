import { NextResponse } from 'next/server'
import { clearSessionCookie, readSession } from '@/lib/server/session'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { clientIp } from '@/lib/server/rate-limit'
import { assertSameOrigin, csrfDeniedResponse } from '@/lib/server/csrf'
import { revokeSession } from '@/lib/server/session-revocation'

export async function POST(request: Request) {
  const csrf = assertSameOrigin(request)
  if (!csrf.ok) return csrfDeniedResponse()

  const admin = await readSession('admin')
  const app = await readSession('app')
  const client = await readSession('client')
  if (admin?.sub && admin.sid) await revokeSession(admin.sub, admin.sid)
  if (app?.sub && app.sid) await revokeSession(app.sub, app.sid)
  if (client?.sub && client.sid) await revokeSession(client.sub, client.sid)

  await clearSessionCookie('admin')
  await clearSessionCookie('app')
  await clearSessionCookie('client')
  await appendSecurityEvent({
    type: 'auth.logout',
    result: 'ok',
    ip: clientIp(request),
    userId: admin?.sub || app?.sub || client?.sub,
  })
  return NextResponse.json({ ok: true })
}
