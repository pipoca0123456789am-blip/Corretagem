/**
 * Autenticação dual (Super Admin × App Corretor/Cliente).
 * Sessões isoladas via cookies + localStorage.
 * Protótipo sem backend — credenciais apenas para desenvolvimento.
 */

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'suporte'
  | 'financeiro'
  | 'corretor'
  | 'assistente'
  | 'cliente'

export type AuthRealm = 'admin' | 'app'

export interface AuthUser {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  status: 'ativo' | 'inativo'
  /** Vincula corretor/assistente ao tenant (realtorId) */
  realtorId: number | null
}

export const DEV_SEED_USERS: AuthUser[] = [
  {
    id: 'u-admin-1',
    name: 'Administrador Principal',
    email: 'admin@plataforma.com.br',
    password: 'Admin@123456',
    role: 'super_admin',
    status: 'ativo',
    realtorId: null,
  },
  {
    id: 'u-corretor-1',
    name: 'Corretor Demonstração',
    email: 'corretor@plataforma.com.br',
    password: 'Corretor@123456',
    role: 'corretor',
    status: 'ativo',
    realtorId: 1,
  },
  {
    id: 'u-cliente-1',
    name: 'Cliente Demonstração',
    email: 'cliente@plataforma.com.br',
    password: 'Cliente@123456',
    role: 'cliente',
    status: 'ativo',
    realtorId: 1,
  },
]

const ADMIN_COOKIE = 'ih_admin_session'
const APP_COOKIE = 'ih_app_session'
const ADMIN_LS = 'ih_admin_auth'
const APP_LS = 'ih_app_auth'

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: UserRole
  realtorId: number | null
  realm: AuthRealm
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function persistSession(realm: AuthRealm, session: SessionPayload) {
  const key = realm === 'admin' ? ADMIN_LS : APP_LS
  const cookie = realm === 'admin' ? ADMIN_COOKIE : APP_COOKIE
  const raw = JSON.stringify(session)
  localStorage.setItem(key, raw)
  setCookie(cookie, raw)
}

function clearSession(realm: AuthRealm) {
  const key = realm === 'admin' ? ADMIN_LS : APP_LS
  const cookie = realm === 'admin' ? ADMIN_COOKIE : APP_COOKIE
  localStorage.removeItem(key)
  clearCookie(cookie)
}

function readSession(realm: AuthRealm): SessionPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const key = realm === 'admin' ? ADMIN_LS : APP_LS
    const cookie = realm === 'admin' ? ADMIN_COOKIE : APP_COOKIE
    const raw = localStorage.getItem(key) || readCookie(cookie)
    if (!raw) return null
    return JSON.parse(raw) as SessionPayload
  } catch {
    return null
  }
}

export function findDevUser(email: string): AuthUser | undefined {
  return DEV_SEED_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'suporte' || role === 'financeiro'
}

export function isRealtorAppRole(role: UserRole): boolean {
  return role === 'corretor' || role === 'assistente'
}

/** Login exclusivo do ambiente Super Admin (/admin/login) */
export function loginAdmin(
  email: string,
  password: string
): { ok: true; user: AuthUser } | { ok: false; error: string } {
  if (typeof window === 'undefined') return { ok: false, error: 'Ambiente inválido' }
  const user = findDevUser(email)
  if (!user || user.password !== password) {
    return { ok: false, error: 'E-mail ou senha inválidos.' }
  }
  if (user.status !== 'ativo') {
    return { ok: false, error: 'Conta inativa.' }
  }
  if (!isAdminRole(user.role)) {
    return {
      ok: false,
      error: 'Esta conta não possui permissão para acessar o ambiente administrativo.',
    }
  }
  persistSession('admin', {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    realtorId: user.realtorId,
    realm: 'admin',
  })
  return { ok: true, user }
}

/** Login do ambiente corretor/usuário (/login) */
export function loginApp(
  email: string,
  password: string
): { ok: true; user: AuthUser; redirectTo: string } | { ok: false; error: string; hintAdmin?: boolean } {
  if (typeof window === 'undefined') return { ok: false, error: 'Ambiente inválido' }
  const user = findDevUser(email)
  if (!user || user.password !== password) {
    return { ok: false, error: 'E-mail ou senha inválidos.' }
  }
  if (user.status !== 'ativo') {
    return { ok: false, error: 'Conta inativa.' }
  }
  if (isAdminRole(user.role)) {
    return {
      ok: false,
      error: 'Esta conta é administrativa. Use o acesso em /admin/login.',
      hintAdmin: true,
    }
  }
  if (user.role === 'cliente') {
    persistSession('app', {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      realtorId: user.realtorId,
      realm: 'app',
    })
    return { ok: true, user, redirectTo: '/cliente/corretor-demonstracao/login' }
  }
  persistSession('app', {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    realtorId: user.realtorId,
    realm: 'app',
  })
  // Compatibilidade com código legado
  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('userEmail', user.email)
  localStorage.setItem('userName', user.name)
  localStorage.setItem('userRole', user.role)
  localStorage.setItem('onboardingComplete', 'true')
  return { ok: true, user, redirectTo: '/dashboard' }
}

export function logoutAdmin(): void {
  if (typeof window === 'undefined') return
  clearSession('admin')
}

export function logoutApp(): void {
  if (typeof window === 'undefined') return
  clearSession('app')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userName')
  localStorage.removeItem('userRole')
  localStorage.removeItem('pendingSignup')
  localStorage.removeItem('onboardingComplete')
}

export function logout(): void {
  logoutApp()
  logoutAdmin()
  if (typeof window === 'undefined') return
  ;[
    'clientAuthenticated',
    'clientEmail',
    'clientName',
    'clientPhone',
    'clientRealtorSlug',
    'clientRealtorId',
    'clientTermsAccepted',
    'clientOnboardingComplete',
    'clientFinancialConsent',
    'clientQualification',
    'clientFavorites',
    'clientCompare',
    'clientDiscarded',
    'clientViewed',
    'clientProfile',
    'clientFinancial',
  ].forEach((key) => localStorage.removeItem(key))
}

export function getAdminSession(): SessionPayload | null {
  const s = readSession('admin')
  return s?.realm === 'admin' ? s : null
}

export function getAppSession(): SessionPayload | null {
  const s = readSession('app')
  return s?.realm === 'app' ? s : null
}

export function isAdminAuthenticated(): boolean {
  const s = getAdminSession()
  return !!s && isAdminRole(s.role)
}

export function isAppAuthenticated(): boolean {
  const s = getAppSession()
  return !!s && (isRealtorAppRole(s.role) || s.role === 'cliente')
}

/** Compat: sessão do app (corretor) ou legado */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  if (isAppAuthenticated()) return true
  return localStorage.getItem('isAuthenticated') === 'true' && !isAdminRole(getUserRole() as UserRole)
}

export function getUserEmail(): string {
  return getAppSession()?.email || getAdminSession()?.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '')
}

export function getUserName(): string {
  return getAppSession()?.name || getAdminSession()?.name || (typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '')
}

export function getUserRole(): UserRole {
  const app = getAppSession()
  if (app) return app.role
  const admin = getAdminSession()
  if (admin) return admin.role
  if (typeof window === 'undefined') return 'corretor'
  return (localStorage.getItem('userRole') as UserRole) || 'corretor'
}

export function getSessionRealtorId(): number | null {
  const app = getAppSession()
  if (app) return app.realtorId
  return null
}

export function isSuperAdmin(): boolean {
  const admin = getAdminSession()
  if (admin) return admin.role === 'super_admin' || admin.role === 'admin'
  // Não considerar sessão do app como admin
  return false
}

export function isSupportAgent(): boolean {
  const admin = getAdminSession()
  return admin?.role === 'suporte'
}

export function canAccessAdminRealm(): boolean {
  return isAdminAuthenticated()
}

export function canAccessRealtorRealm(): boolean {
  const s = getAppSession()
  return !!s && isRealtorAppRole(s.role)
}

/** @deprecated Use loginApp — mantido para páginas antigas */
export function login(email: string, password: string): boolean {
  const result = loginApp(email, password)
  if (result.ok) return true
  // Tentativa admin neste login antigo não deve autenticar no app
  return false
}

/** Limpa dados locais de desenvolvimento (seed / sessões antigas) */
export function resetDevLocalData(): void {
  if (typeof window === 'undefined') return
  const keys = [
    ADMIN_LS,
    APP_LS,
    'isAuthenticated',
    'userEmail',
    'userName',
    'userRole',
    'pendingSignup',
    'onboardingComplete',
    'phase12ProfessionalRequests',
    'phase13AiIntegrations',
    'imovelhub_support_tickets',
    'imovelhub_service_requests',
    'imovelhub_notifications',
    'phase14_subscriptions',
    'phase14_invoices',
    'phase14_coupons',
    'phase14_plans',
  ]
  keys.forEach((k) => localStorage.removeItem(k))
  clearCookie(ADMIN_COOKIE)
  clearCookie(APP_COOKIE)
  // Marca seed limpa
  localStorage.setItem('ih_dev_seed_version', '2026-07-28-v1')
}

export function ensureCleanDevSeed(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('ih_dev_seed_version') !== '2026-07-28-v1') {
    resetDevLocalData()
  }
}

export const AUTH_COOKIES = { ADMIN_COOKIE, APP_COOKIE }
