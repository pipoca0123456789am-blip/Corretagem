/**
 * Guards de autorização — delegam a policies (fonte única).
 * Mantido para imports existentes (`@/lib/server/guards`).
 */

export {
  AuthError,
  requireSession,
  requireAdmin,
  requireSuperAdmin,
  requireBroker,
  requireClient,
  requireTenantRealtorId,
  requirePermission,
  assertTenantOwnership,
  stripUntrustedTenantFields,
  roleHasPermission,
} from '@/lib/server/policies'

export type { Permission } from '@/lib/server/policies'
