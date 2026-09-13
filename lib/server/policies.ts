/**
 * Políticas de autorização centralizadas + ownership/tenant.
 * broker_id / tenant_id do request NUNCA são fonte de verdade.
 */

import { readSession, type SessionClaims } from '@/lib/server/session'
import { findUserById, isAdminRole, isRealtorAppRole, type UserRole } from '@/lib/server/users'
import { appendSecurityEvent } from '@/lib/server/security-log'
import { roleHasPermission, type Permission } from '@/lib/server/rbac'

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export { roleHasPermission }
export type { Permission }

async function deny(detail: string, status = 403): Promise<never> {
  await appendSecurityEvent({
    type: 'auth.permission_denied',
    result: 'denied',
    detail,
  })
  throw new AuthError(status === 401 ? 'Sessão inválida' : 'Acesso negado', status)
}

/** Re-valida role/status no store (DB) — obrigatório em ações privilegiadas. */
async function revalidateUser(
  session: SessionClaims,
  predicate: (role: UserRole, status: string) => boolean
): Promise<SessionClaims> {
  const user = await findUserById(session.sub!)
  if (!user || user.status !== 'ativo') {
    return deny('user-inactive-or-missing', 401)
  }
  if (!predicate(user.role, user.status)) {
    return deny('role-mismatch', 403)
  }
  if (user.role !== session.role) {
    return deny('role-changed', 401)
  }
  if (user.realtorId !== session.realtorId) {
    return { ...session, realtorId: user.realtorId, role: user.role }
  }
  return session
}

export async function requireSession(realm?: 'admin' | 'app' | 'client'): Promise<SessionClaims> {
  if (realm) {
    const s = await readSession(realm)
    if (!s) return deny(`requireSession:${realm}`, 401)
    return revalidateUser(s, () => true)
  }
  const admin = await readSession('admin')
  if (admin) return revalidateUser(admin, (r) => isAdminRole(r))
  const app = await readSession('app')
  if (app) return revalidateUser(app, (r) => isRealtorAppRole(r))
  const client = await readSession('client')
  if (client) return revalidateUser(client, (r) => r === 'cliente')
  return deny('requireSession:none', 401)
}

export async function requireAdmin(): Promise<SessionClaims> {
  const session = await readSession('admin')
  if (!session || !isAdminRole(session.role as UserRole)) {
    return deny('requireAdmin', 403)
  }
  return revalidateUser(session, (r) => isAdminRole(r))
}

export async function requireSuperAdmin(): Promise<SessionClaims> {
  const session = await requireAdmin()
  if (session.role !== 'super_admin' && session.role !== 'admin') {
    return deny('requireSuperAdmin', 403)
  }
  return session
}

export async function requireBroker(): Promise<SessionClaims> {
  const session = await readSession('app')
  if (!session || !isRealtorAppRole(session.role as UserRole)) {
    return deny('requireBroker', 403)
  }
  return revalidateUser(session, (r) => isRealtorAppRole(r))
}

export async function requireClient(): Promise<SessionClaims> {
  const session = await readSession('client')
  if (!session || session.role !== 'cliente' || session.realm !== 'client') {
    return deny('requireClient', 403)
  }
  return revalidateUser(session, (r) => r === 'cliente')
}

/** Tenant isolation: realtorId da sessão/DB, nunca do body/query. */
export function requireTenantRealtorId(session: SessionClaims): number {
  if (session.realtorId == null) {
    throw new AuthError('Conta sem tenant vinculado', 403)
  }
  return session.realtorId
}

export async function requirePermission(permission: Permission): Promise<SessionClaims> {
  const admin = await readSession('admin')
  if (
    admin &&
    isAdminRole(admin.role as UserRole) &&
    roleHasPermission(admin.role as UserRole, permission)
  ) {
    return revalidateUser(admin, (r) => isAdminRole(r) && roleHasPermission(r, permission))
  }
  const broker = await readSession('app')
  if (
    broker &&
    isRealtorAppRole(broker.role as UserRole) &&
    roleHasPermission(broker.role as UserRole, permission)
  ) {
    return revalidateUser(
      broker,
      (r) => isRealtorAppRole(r) && roleHasPermission(r, permission)
    )
  }
  return deny(`requirePermission:${permission}`, 403)
}

/** Ownership: recurso deve pertencer ao tenant da sessão. */
export function assertTenantOwnership(
  session: SessionClaims,
  resourceRealtorId: number | null | undefined
): void {
  const tenant = requireTenantRealtorId(session)
  if (resourceRealtorId == null || resourceRealtorId !== tenant) {
    throw new AuthError('Recurso não encontrado', 404)
  }
}

/** Ignora/neutraliza tentativas de override de tenant via input. */
export function stripUntrustedTenantFields<T extends Record<string, unknown>>(
  body: T
): Omit<T, 'broker_id' | 'realtorId' | 'realtor_id' | 'tenant_id' | 'tenantId'> {
  const {
    broker_id: _b,
    realtorId: _r,
    realtor_id: _ri,
    tenant_id: _t,
    tenantId: _ti,
    ...rest
  } = body
  return rest
}
