import { NextResponse } from 'next/server'
import {
  requirePermission,
  requireTenantRealtorId,
  AuthError,
} from '@/lib/server/guards'
import { jsonAuthError } from '@/lib/server/api-error'
import { listPropertiesForSession, auditTenantRead } from '@/lib/server/repositories'
import { isAdminRole } from '@/lib/server/users'
import type { UserRole } from '@/lib/server/users'
import { clientIp } from '@/lib/server/rate-limit'

/**
 * GET /api/properties — lista imóveis do tenant da sessão (nunca do query).
 * Query broker_id / realtor_id / tenant_id são ignorados de propósito.
 */
export async function GET(request: Request) {
  try {
    const session = await requirePermission('broker:read')
    if (isAdminRole(session.role as UserRole) && session.realtorId == null) {
      throw new AuthError('Use painel admin para visão global', 403)
    }
    const tenantId = requireTenantRealtorId(session)

    const url = new URL(request.url)
    // Fail closed: override via query descartado
    void url.searchParams.get('broker_id')
    void url.searchParams.get('realtorId')
    void url.searchParams.get('tenant_id')

    const items = listPropertiesForSession(session)
    await auditTenantRead(session, 'properties', clientIp(request))
    return NextResponse.json({ ok: true, tenantId, items })
  } catch (err) {
    return jsonAuthError(err)
  }
}
