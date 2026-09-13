/**
 * Helpers de autenticação no cliente (UI only).
 * Fonte de verdade = JWT HttpOnly (`ih_admin_sid` / `ih_app_sid`) + middleware + /api/auth/me.
 * Nunca grava senha; cookies legados forjáveis são limpos, não emitidos.
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

/** Perfil público para UI (sem senha). */
export interface PublicAuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'ativo' | 'inativo'
  realtorId: number | null
}

/** @deprecated Use PublicAuthUser — senha removida do cliente */
export type AuthUser = PublicAuthUser

/** E-mails de demo (sem senhas no bundle). Senhas só no server seed. */
export const DEV_SEED_USERS: PublicAuthUser[] = [
  {
    id: 'u-admin-1',
    name: 'Administrador Principal',
    email: 'admin@plataforma.com.br',
    role: 'super_admin',
    status: 'ativo',
    realtorId: null,
  },
  {
    id: 'u-corretor-1',
    name: 'Corretor Demonstração',
    email: 'corretor@plataforma.com.br',
    role: 'corretor',
    status: 'ativo',
    realtorId: 1,
  },
  {
    id: 'u-cliente-1',
    name: 'Cliente Demonstração',
    email: 'cliente@plataforma.com.br',
    role: 'cliente',
    status: 'ativo',
    realtorId: 1,
  },
]

const LEGACY_ADMIN_COOKIE = 'ih_admin_session'
const LEGACY_APP_COOKIE = 'ih_app_session'
const ADMIN_LS = 'ih_admin_profile'
const APP_LS = 'ih_app_profile'

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: UserRole
  realtorId: number | null
  realm: AuthRealm
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

function scrubLegacyAuthArtifacts() {
  if (typeof window === 'undefined') return
  clearCookie(LEGACY_ADMIN_COOKIE)
  clearCookie(LEGACY_APP_COOKIE)
  localStorage.removeItem('ih_admin_auth')
  localStorage.removeItem('ih_app_auth')
  localStorage.removeItem('ih_registered_users')
  localStorage.removeItem('pendingSignup')
  localStorage.removeItem('isAuthenticated')
}

/** Cache de perfil para UI (não autoriza rotas). */
export function cachePublicSession(session: SessionPayload): void {
  if (typeof window === 'undefined') return
  scrubLegacyAuthArtifacts()
  const key = session.realm === 'admin' ? ADMIN_LS : APP_LS
  localStorage.setItem(key, JSON.stringify(session))
  if (session.realm === 'app' && (session.role === 'corretor' || session.role === 'assistente')) {
    localStorage.setItem('userEmail', session.email)
    localStorage.setItem('userName', session.name)
    // Prefs de UI — NÃO são prova de autenticação (middleware + cookie são)
    localStorage.setItem('onboardingComplete', 'true')
  }
}

function clearProfile(realm: AuthRealm) {
  const key = realm === 'admin' ? ADMIN_LS : APP_LS
  localStorage.removeItem(key)
  clearCookie(LEGACY_ADMIN_COOKIE)
  clearCookie(LEGACY_APP_COOKIE)
}

function readProfile(realm: AuthRealm): SessionPayload | null {
  if (typeof window === 'undefined') return null
  try {
    scrubLegacyAuthArtifacts()
    const key = realm === 'admin' ? ADMIN_LS : APP_LS
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionPayload
    if (parsed.realm !== realm) return null
    return parsed
  } catch {
    return null
  }
}

async function serverLogout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
  } catch {
    /* ignore */
  }
}

/** Cadastro legado — DESATIVADO. Use POST /api/auth/register */
export function registerRealtor(_input: {
  firstName: string
  lastName: string
  email: string
  password: string
}): { ok: false; error: string } {
  return {
    ok: false,
    error: 'Cadastro client-side desativado. Use o fluxo /cadastro com verificação de e-mail.',
  }
}

export function findDevUser(email: string): PublicAuthUser | undefined {
  return DEV_SEED_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'suporte' || role === 'financeiro'
}

export function isRealtorAppRole(role: UserRole): boolean {
  return role === 'corretor' || role === 'assistente'
}

/** @deprecated Use POST /api/auth/admin/login */
export function loginAdmin(
  _email: string,
  _password: string
): { ok: false; error: string } {
  return {
    ok: false,
    error: 'Login client-side desativado. Use /admin/login (API assinada).',
  }
}

/** @deprecated Use POST /api/auth/login */
export function loginApp(
  _email: string,
  _password: string
): { ok: false; error: string; hintAdmin?: boolean } {
  return {
    ok: false,
    error: 'Login client-side desativado. Use /login (API assinada).',
  }
}

export async function logoutAdmin(): Promise<void> {
  if (typeof window === 'undefined') return
  await serverLogout()
  clearProfile('admin')
  scrubLegacyAuthArtifacts()
}

export async function logoutApp(): Promise<void> {
  if (typeof window === 'undefined') return
  await serverLogout()
  clearProfile('app')
  scrubLegacyAuthArtifacts()
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userName')
  localStorage.removeItem('userRole')
  localStorage.removeItem('onboardingComplete')
}

export async function logout(): Promise<void> {
  await logoutApp()
  await logoutAdmin()
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
  const s = readProfile('admin')
  return s?.realm === 'admin' ? s : null
}

export function getAppSession(): SessionPayload | null {
  const s = readProfile('app')
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

/**
 * @deprecated NÃO usar como fonte de verdade de auth.
 * Middleware + /api/auth/me são autoritativos. Mantido só para UI legada.
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return isAppAuthenticated()
}

export function getUserEmail(): string {
  return (
    getAppSession()?.email ||
    getAdminSession()?.email ||
    (typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '')
  )
}

export function getUserName(): string {
  return (
    getAppSession()?.name ||
    getAdminSession()?.name ||
    (typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '')
  )
}

export function getUserRole(): UserRole {
  const app = getAppSession()
  if (app) return app.role
  const admin = getAdminSession()
  if (admin) return admin.role
  return 'corretor'
}

export function getSessionRealtorId(): number | null {
  const app = getAppSession()
  if (app) return app.realtorId
  return null
}

export function isSuperAdmin(): boolean {
  const admin = getAdminSession()
  if (admin) return admin.role === 'super_admin' || admin.role === 'admin'
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

/** @deprecated */
export function login(_email: string, _password: string): boolean {
  return false
}

/** Limpa dados locais de desenvolvimento (seed / sessões antigas) */
export function resetDevLocalData(): void {
  if (typeof window === 'undefined') return
  const keys = [
    ADMIN_LS,
    APP_LS,
    'ih_admin_auth',
    'ih_app_auth',
    'isAuthenticated',
    'userEmail',
    'userName',
    'userRole',
    'pendingSignup',
    'onboardingComplete',
    'ih_registered_users',
    'phase12ProfessionalRequests',
    'phase13AiIntegrations',
    'imovelhub_support_tickets',
    'imovelhub_service_requests',
    'imovelhub_notifications',
    'phase14Plans_v2',
    'phase14Subscriptions_v2',
    'phase14Invoices_v2',
    'phase14Coupons_v2',
    'phase14_subscriptions',
    'phase14_invoices',
    'phase14_coupons',
    'phase14_plans',
    'imovelhub_meu_site_settings',
    'imovelhub_site_publish',
    'imovelhub_site_analytics',
    'imovelhub_site_leads',
    'imovelhub_access_logs_v1',
    'imovelhub_crm_leads',
    'imovelhub_site_extra_properties',
    'imovelhub_site_archived_ids',
    'imovelhub_page_templates_v1',
    'imovelhub_template_categories_v1',
    'imovelhub_broker_template_subs_v1',
    'imovelhub_broker_template_custom_v1',
    'imovelhub_broker_domains_v1',
    'imovelhub_domain_orders_v1',
    'imovelhub_domain_searches_v1',
    'imovelhub_template_metrics_v1',
    'imovelhub_template_marketplace_config_v1',
    'imovelhub_template_history_v1',
    'imovelhub_domain_search_rate_v1',
    'imovelhub_pwa_prefs',
    'imovelhub_pwa_events',
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
  ]
  keys.forEach((k) => localStorage.removeItem(k))
  clearCookie(LEGACY_ADMIN_COOKIE)
  clearCookie(LEGACY_APP_COOKIE)
  localStorage.setItem('ih_dev_seed_version', '2026-08-20-v3-secure')
}

export function ensureCleanDevSeed(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('ih_dev_seed_version') !== '2026-08-20-v3-secure') {
    resetDevLocalData()
  }
}

export const AUTH_COOKIES = {
  ADMIN_COOKIE: LEGACY_ADMIN_COOKIE,
  APP_COOKIE: LEGACY_APP_COOKIE,
}
