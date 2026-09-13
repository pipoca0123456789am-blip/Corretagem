import { NextResponse } from 'next/server'
import {
  requirePermission,
  requireTenantRealtorId,
  AuthError,
} from '@/lib/server/guards'
import { jsonAuthError } from '@/lib/server/api-error'
import { listClientsForSession, auditTenantRead } from '@/lib/server/repositories'
import { isAdminRole } from '@/lib/server/users'
import type { UserRole } from '@/lib/server/users'
import { clientIp } from '@/lib/server/rate-limit'

/** GET /api/clients — clientes do tenant da sessão. */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('broker:read')
    if (isAdminRole(session.role as UserRole) && session.realtorId == null) {
      throw new AuthError('Use painel admin para visão global', 403)
    }
    const tenantId = requireTenantRealtorId(session)
    const items = listClientsForSession(session)
    await auditTenantRead(session, 'clients', clientIp(request))
    return NextResponse.json({ ok: true, tenantId, items })
  } catch (err) {
    return jsonAuthError(err)
  }
}
