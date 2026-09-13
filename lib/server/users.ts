import { hashPassword, verifyPassword } from '@/lib/server/password'
import { assertDevSeedAllowed, isDevSeedEnabled } from '@/lib/server/secrets'
import { getUserStore } from '@/lib/server/store'
import type {
  ServerUser,
  UserRole,
  AuthRealm,
  UserStatus,
  PublicUser,
} from '@/lib/server/user-types'

export type { ServerUser, UserRole, AuthRealm, UserStatus, PublicUser }

async function ensureStore(): Promise<ServerUser[]> {
  const store = getUserStore()
  let users = await store.list()
  if (users.length === 0 && isDevSeedEnabled()) {
    await seedDevUsers()
    users = await store.list()
  }
  return users
}

async function persist(users: ServerUser[]) {
  await getUserStore().save(users)
}

async function seedDevUsers() {
  assertDevSeedAllowed()
  const now = new Date().toISOString()
  const seeds: Array<Omit<ServerUser, 'passwordHash'> & { password: string }> = [
    {
      id: 'u-admin-1',
      name: 'Administrador Principal',
      email: 'admin@plataforma.com.br',
      password: 'Admin@123456',
      role: 'super_admin',
      status: 'ativo',
      realtorId: null,
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'u-corretor-1',
      name: 'Corretor Demonstração',
      email: 'corretor@plataforma.com.br',
      password: 'Corretor@123456',
      role: 'corretor',
      status: 'ativo',
      realtorId: 1,
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'u-cliente-1',
      name: 'Cliente Demonstração',
      email: 'cliente@plataforma.com.br',
      password: 'Cliente@123456',
      role: 'cliente',
      status: 'ativo',
      realtorId: 1,
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]

  const users: ServerUser[] = []
  for (const s of seeds) {
    const { password, ...rest } = s
    users.push({ ...rest, passwordHash: await hashPassword(password) })
  }
  await persist(users)
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'suporte' || role === 'financeiro'
}

export function isRealtorAppRole(role: UserRole): boolean {
  return role === 'corretor' || role === 'assistente'
}

export async function findUserByEmail(email: string): Promise<ServerUser | null> {
  const users = await ensureStore()
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null
}

export async function findUserById(id: string): Promise<ServerUser | null> {
  const users = await ensureStore()
  return users.find((u) => u.id === id) || null
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ ok: true; user: ServerUser } | { ok: false; error: string }> {
  const user = await findUserByEmail(email)
  if (!user) return { ok: false, error: 'E-mail ou senha inválidos.' }
  const match = await verifyPassword(password, user.passwordHash)
  if (!match) return { ok: false, error: 'E-mail ou senha inválidos.' }
  if (user.status === 'inativo') return { ok: false, error: 'Conta inativa.' }
  if (user.status === 'pending_verification') {
    return { ok: false, error: 'Confirme seu e-mail antes de entrar.' }
  }
  return { ok: true, user }
}

export function toPublicUser(user: ServerUser): PublicUser {
  const {
    passwordHash: _p,
    totpSecretEnc: _s,
    totpRecoveryHashes: _r,
    ...rest
  } = user
  return {
    ...rest,
    totpEnabled: Boolean(user.totpEnabled),
  }
}

export async function createPendingRealtor(input: {
  firstName: string
  lastName: string
  email: string
  passwordHash: string
}): Promise<ServerUser> {
  const users = await ensureStore()
  const email = input.email.trim().toLowerCase()
  if (users.some((u) => u.email === email)) {
    throw new Error('EMAIL_EXISTS')
  }
  const now = new Date().toISOString()
  const user: ServerUser = {
    id: `u-signup-${crypto.randomUUID()}`,
    name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim() || 'Novo Corretor',
    email,
    passwordHash: input.passwordHash,
    role: 'corretor',
    status: 'pending_verification',
    realtorId: Date.now() % 100000,
    emailVerifiedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  users.push(user)
  await persist(users)
  return user
}

/** Cadastro de cliente vinculado a um corretor (tenant). */
export async function createClientUser(input: {
  name: string
  email: string
  phone?: string
  passwordHash: string
  realtorId: number
  activateImmediately?: boolean
}): Promise<ServerUser> {
  const users = await ensureStore()
  const email = input.email.trim().toLowerCase()
  if (users.some((u) => u.email === email)) {
    throw new Error('EMAIL_EXISTS')
  }
  const now = new Date().toISOString()
  const active = Boolean(input.activateImmediately)
  const user: ServerUser = {
    id: `u-client-${crypto.randomUUID()}`,
    name: input.name.trim() || 'Cliente',
    email,
    passwordHash: input.passwordHash,
    role: 'cliente',
    status: active ? 'ativo' : 'pending_verification',
    realtorId: input.realtorId,
    emailVerifiedAt: active ? now : null,
    createdAt: now,
    updatedAt: now,
  }
  users.push(user)
  await persist(users)
  return user
}

export async function activateUser(userId: string): Promise<ServerUser | null> {
  const users = await ensureStore()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return null
  const now = new Date().toISOString()
  users[idx] = {
    ...users[idx],
    status: 'ativo',
    emailVerifiedAt: now,
    updatedAt: now,
  }
  await persist(users)
  return users[idx]
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<boolean> {
  const users = await ensureStore()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return false
  users[idx] = { ...users[idx], passwordHash, updatedAt: new Date().toISOString() }
  await persist(users)
  return true
}

export async function updateUserTotp(
  userId: string,
  patch: {
    totpSecretEnc?: string | null
    totpEnabled?: boolean
    totpRecoveryHashes?: string[]
  }
): Promise<ServerUser | null> {
  const users = await ensureStore()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx < 0) return null
  users[idx] = {
    ...users[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  await persist(users)
  return users[idx]
}

/** Backend atual do store (para /api/auth/me diagnostics em não-prod). */
export function getUsersStoreBackend() {
  return getUserStore().backend
}
