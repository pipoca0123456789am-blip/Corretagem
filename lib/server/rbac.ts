import type { UserRole } from '@/lib/server/users'

export type Permission =
  | 'admin:read'
  | 'admin:write'
  | 'admin:billing'
  | 'admin:support'
  | 'broker:read'
  | 'broker:write'
  | 'broker:team'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'admin:read',
    'admin:write',
    'admin:billing',
    'admin:support',
    'broker:read',
    'broker:write',
    'broker:team',
  ],
  admin: ['admin:read', 'admin:write', 'admin:billing', 'admin:support'],
  financeiro: ['admin:read', 'admin:billing'],
  suporte: ['admin:read', 'admin:support'],
  corretor: ['broker:read', 'broker:write', 'broker:team'],
  assistente: ['broker:read', 'broker:write'],
  cliente: [],
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
