import { NextResponse } from 'next/server'
import {
  requirePermission,
  requireTenantRealtorId,
  AuthError,
  roleHasPermission,
} from '@/lib/server/guards'
import { jsonAuthError } from '@/lib/server/api-error'
import { listLeadsForSession, auditTenantRead } from '@/lib/server/repositories'
import { isAdminRole, isRealtorAppRole, findUserById } from '@/lib/server/users'
import type { UserRole } from '@/lib/server/users'
import { readSession } from '@/lib/server/session'
import { clientIp } from '@/lib/server/rate-limit'

/**
 * GET /api/leads
 * Admin (admin:read) → todos; broker (broker:read) → só do próprio tenant.
 * Nunca confiar em realtorId do query/body.
 */
export async function GET(request: Request) {
  try {
    const admin = await readSession('admin')
    if (
      admin &&
      isAdminRole(admin.role as UserRole) &&
      roleHasPermission(admin.role as UserRole, 'admin:read')
    ) {
      const user = await findUserById(admin.sub!)
      if (!user || user.status !== 'ativo') throw new AuthError('Sessão inválida', 401)
      const items = listLeadsForSession(admin)
      await auditTenantRead(admin, 'leads', clientIp(request))
      return NextResponse.json({ ok: true, scope: 'admin', items })
    }

    const session = await requirePermission('broker:read')
    if (!isRealtorAppRole(session.role as UserRole)) {
      throw new AuthError('Permissão insuficiente', 403)
    }
    const tenantId = requireTenantRealtorId(session)
    const items = listLeadsForSession(session)
    await auditTenantRead(session, 'leads', clientIp(request))
    return NextResponse.json({
      ok: true,
      scope: 'broker',
      tenantId,
      items,
    })
  } catch (err) {
    return jsonAuthError(err)
  }
}
