/**
 * Repositórios de domínio com filtro de tenant (anti-IDOR).
 * broker_id/tenant_id do request são ignorados — sempre session.realtorId.
 */

import {
  listPropertiesForTenant,
  listClientsForTenant,
  listDocumentsForTenant,
  listLeadsForBroker,
  listLeadsForAdmin,
  type DemoProperty,
  type DemoClient,
  type DemoDocument,
  type DemoLead,
} from '@/lib/server/domain-demo'
import type { SessionClaims } from '@/lib/server/session'
import {
  assertTenantOwnership,
  requireTenantRealtorId,
  AuthError,
} from '@/lib/server/policies'
import { isAdminRole } from '@/lib/server/users'
import type { UserRole } from '@/lib/server/users'
import { appendAuditLog } from '@/lib/server/audit-log'

/** Serializers — nunca expor secrets. */
export function serializeProperty(p: DemoProperty) {
  return { id: p.id, title: p.title, realtorId: p.realtorId, city: p.city, status: p.status }
}

export function serializeClient(c: DemoClient) {
  return { id: c.id, name: c.name, email: c.email, realtorId: c.realtorId }
}

export function serializeLead(l: DemoLead) {
  return { id: l.id, name: l.name, source: l.source, realtorId: l.realtorId }
}

export function serializeDocument(d: DemoDocument) {
  return { id: d.id, title: d.title, realtorId: d.realtorId, clientId: d.clientId }
}

export function listPropertiesForSession(session: SessionClaims) {
  if (isAdminRole(session.role as UserRole) && session.realtorId == null) {
    throw new AuthError('Use painel admin para visão global', 403)
  }
  const tenantId = requireTenantRealtorId(session)
  return listPropertiesForTenant(tenantId).map(serializeProperty)
}

export function listClientsForSession(session: SessionClaims) {
  const tenantId = requireTenantRealtorId(session)
  return listClientsForTenant(tenantId).map(serializeClient)
}

export function listDocumentsForSession(session: SessionClaims) {
  const tenantId = requireTenantRealtorId(session)
  return listDocumentsForTenant(tenantId).map(serializeDocument)
}

export function listLeadsForSession(session: SessionClaims) {
  if (isAdminRole(session.role as UserRole)) {
    return listLeadsForAdmin().map(serializeLead)
  }
  const tenantId = requireTenantRealtorId(session)
  return listLeadsForBroker(tenantId).map(serializeLead)
}

export function getPropertyForSession(session: SessionClaims, id: string) {
  const tenantId = requireTenantRealtorId(session)
  const item = listPropertiesForTenant(tenantId).find((p) => p.id === id)
  if (!item) throw new AuthError('Recurso não encontrado', 404)
  assertTenantOwnership(session, item.realtorId)
  return serializeProperty(item)
}

export function getClientForSession(session: SessionClaims, id: string) {
  const tenantId = requireTenantRealtorId(session)
  const item = listClientsForTenant(tenantId).find((c) => c.id === id)
  if (!item) throw new AuthError('Recurso não encontrado', 404)
  assertTenantOwnership(session, item.realtorId)
  return serializeClient(item)
}

export function getDocumentForSession(session: SessionClaims, id: string) {
  const tenantId = requireTenantRealtorId(session)
  const item = listDocumentsForTenant(tenantId).find((d) => d.id === id)
  if (!item) throw new AuthError('Recurso não encontrado', 404)
  assertTenantOwnership(session, item.realtorId)
  return serializeDocument(item)
}

export function getLeadForSession(session: SessionClaims, id: string) {
  if (isAdminRole(session.role as UserRole)) {
    const item = listLeadsForAdmin().find((l) => l.id === id)
    if (!item) throw new AuthError('Recurso não encontrado', 404)
    return serializeLead(item)
  }
  const tenantId = requireTenantRealtorId(session)
  const item = listLeadsForBroker(tenantId).find((l) => l.id === id)
  if (!item) throw new AuthError('Recurso não encontrado', 404)
  assertTenantOwnership(session, item.realtorId)
  return serializeLead(item)
}

/** Stub agenda/visitas — quando APIs existirem, usar o mesmo padrão. */
export function listAgendaStubForSession(session: SessionClaims) {
  const tenantId = requireTenantRealtorId(session)
  return { tenantId, items: [] as { id: string; title: string; realtorId: number }[] }
}

export async function auditTenantRead(
  session: SessionClaims,
  resourceType: string,
  ip?: string
) {
  await appendAuditLog({
    actorUserId: session.sub,
    actorRole: session.role,
    action: 'read',
    resourceType,
    tenantRealtorId: session.realtorId,
    ip,
  })
}

/**
 * Simula Broker A vs B: recurso de outro tenant → 404 (não vaza existência cross-tenant).
 */
export function assertBrokerCannotAccessOtherTenant(
  brokerARealtorId: number,
  resourceRealtorId: number
): 'ok' | 'forbidden' {
  return brokerARealtorId === resourceRealtorId ? 'ok' : 'forbidden'
}
