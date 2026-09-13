/**
 * Portal do cliente — UI helpers.
 * Auth autoritativa: JWT HttpOnly `ih_client_sid` + middleware + /api/auth/me.
 * Prefs (favoritos etc.) permanecem em localStorage (não são credenciais).
 * NUNCA usar localStorage como prova de autenticação.
 */

const CLIENT_KEYS = {
  profile: 'ih_client_profile',
  email: 'clientEmail',
  name: 'clientName',
  phone: 'clientPhone',
  realtorSlug: 'clientRealtorSlug',
  realtorId: 'clientRealtorId',
  terms: 'clientTermsAccepted',
  onboarding: 'clientOnboardingComplete',
  financialConsent: 'clientFinancialConsent',
  favorites: 'clientFavorites',
  compare: 'clientCompare',
  discarded: 'clientDiscarded',
  viewed: 'clientViewed',
  qualification: 'clientQualification',
  profileJson: 'clientProfile',
  financial: 'clientFinancial',
  /** legado forjável — limpo, nunca usado para auth */
  authLegacy: 'clientAuthenticated',
} as const

export interface ClientSession {
  email: string
  name: string
  phone: string
  realtorSlug: string
  realtorId: number
  termsAccepted: boolean
  onboardingComplete: boolean
  financialConsent: boolean
}

interface ClientProfileCache {
  userId: string
  email: string
  name: string
  realtorSlug: string
  realtorId: number
  realm: 'client'
  /** Epoch ms da última sincronização com /api/auth/me */
  syncedAt?: number
}

function canUseStorage() {
  return typeof window !== 'undefined'
}

function scrubLegacyAuthFlag() {
  if (!canUseStorage()) return
  localStorage.removeItem(CLIENT_KEYS.authLegacy)
  localStorage.removeItem('isAuthenticated')
}

function writeProfileCache(profile: ClientProfileCache) {
  if (!canUseStorage()) return
  scrubLegacyAuthFlag()
  localStorage.setItem(
    CLIENT_KEYS.profile,
    JSON.stringify({ ...profile, syncedAt: Date.now() })
  )
  localStorage.setItem(CLIENT_KEYS.email, profile.email)
  localStorage.setItem(CLIENT_KEYS.name, profile.name)
  localStorage.setItem(CLIENT_KEYS.realtorSlug, profile.realtorSlug)
  localStorage.setItem(CLIENT_KEYS.realtorId, String(profile.realtorId))
  localStorage.setItem('userEmail', profile.email)
  localStorage.setItem('userName', profile.name)
}

function readProfileCache(): ClientProfileCache | null {
  if (!canUseStorage()) return null
  scrubLegacyAuthFlag()
  try {
    const raw = localStorage.getItem(CLIENT_KEYS.profile)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ClientProfileCache
    if (parsed.realm !== 'client' || !parsed.email) return null
    return parsed
  } catch {
    return null
  }
}

function clearProfileCache() {
  if (!canUseStorage()) return
  localStorage.removeItem(CLIENT_KEYS.profile)
  localStorage.removeItem('userRole')
}

/** Login via API assinada (cookie HttpOnly). */
export async function loginClient(params: {
  email: string
  password: string
  realtorSlug: string
  realtorId: number
  name?: string
  phone?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!canUseStorage()) return { ok: false, error: 'Indisponível' }
  if (!params.email || !params.password) {
    return { ok: false, error: 'Informe e-mail e senha para entrar.' }
  }

  const existingSlug = localStorage.getItem(CLIENT_KEYS.realtorSlug)
  if (existingSlug && existingSlug !== params.realtorSlug) {
    clearClientLists()
  }

  try {
    const res = await fetch('/api/auth/client/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        realtorSlug: params.realtorSlug,
      }),
    })
    const data = (await res.json()) as {
      ok?: boolean
      error?: string
      user?: { id: string; email: string; name: string }
      realtorSlug?: string
      realtorId?: number
    }
    if (!res.ok || !data.ok || !data.user) {
      return { ok: false, error: data.error || 'Falha no login.' }
    }

    writeProfileCache({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name || params.name || params.email.split('@')[0],
      realtorSlug: data.realtorSlug || params.realtorSlug,
      realtorId: data.realtorId ?? params.realtorId,
      realm: 'client',
    })
    if (params.phone) localStorage.setItem(CLIENT_KEYS.phone, params.phone)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Não foi possível entrar. Tente novamente.' }
  }
}

/** Cadastro + sessão (DEV seed ativa imediatamente). */
export async function registerClient(params: {
  name: string
  email: string
  phone: string
  password: string
  realtorSlug: string
  realtorId: number
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch('/api/auth/client/register', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        phone: params.phone,
        password: params.password,
        realtorSlug: params.realtorSlug,
      }),
    })
    const data = (await res.json()) as {
      ok?: boolean
      error?: string
      user?: { id: string; email: string; name: string }
      realtorSlug?: string
      realtorId?: number
      needsEmailVerification?: boolean
    }
    if (!res.ok || !data.ok || !data.user) {
      return { ok: false, error: data.error || 'Falha no cadastro.' }
    }
    if (data.needsEmailVerification) {
      return {
        ok: false,
        error:
          'Conta criada. Confirme o e-mail antes de entrar (verifique sua caixa de entrada).',
      }
    }
    writeProfileCache({
      userId: data.user.id,
      email: data.user.email,
      name: data.user.name,
      realtorSlug: data.realtorSlug || params.realtorSlug,
      realtorId: data.realtorId ?? params.realtorId,
      realm: 'client',
    })
    localStorage.setItem(CLIENT_KEYS.phone, params.phone)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Não foi possível cadastrar. Tente novamente.' }
  }
}

/** Sincroniza cache UI com /api/auth/me (cookie). Fonte de verdade. */
export async function syncClientSessionFromServer(
  realtorSlugHint?: string
): Promise<ClientProfileCache | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
    if (!res.ok) {
      clearProfileCache()
      return null
    }
    const data = (await res.json()) as {
      ok?: boolean
      realm?: string
      session?: { userId: string; email: string; name: string; realtorId: number | null }
      user?: { id: string; email: string; name: string }
    }
    if (!data.ok || data.realm !== 'client' || !data.session) {
      if (data.realm === 'admin') return null
      clearProfileCache()
      return null
    }
    const slug =
      realtorSlugHint ||
      (canUseStorage() && localStorage.getItem(CLIENT_KEYS.realtorSlug)) ||
      ''
    const profile: ClientProfileCache = {
      userId: data.session.userId,
      email: data.session.email,
      name: data.session.name,
      realtorSlug: slug,
      realtorId: data.session.realtorId ?? 0,
      realm: 'client',
    }
    writeProfileCache(profile)
    return profile
  } catch {
    return null
  }
}

/**
 * @deprecated NÃO usar como SoT de auth — preferir syncClientSessionFromServer / middleware.
 * Cache UI só conta após sync recente com o servidor.
 */
export function isClientAuthenticated(): boolean {
  const profile = readProfileCache()
  if (!profile?.syncedAt) return false
  return Date.now() - profile.syncedAt < 5 * 60 * 1000
}

export function getClientSession(): ClientSession | null {
  const profile = readProfileCache()
  if (!profile) return null
  return {
    email: profile.email,
    name: profile.name,
    phone: (canUseStorage() && localStorage.getItem(CLIENT_KEYS.phone)) || '',
    realtorSlug: profile.realtorSlug || localStorage.getItem(CLIENT_KEYS.realtorSlug) || '',
    realtorId: profile.realtorId,
    termsAccepted: localStorage.getItem(CLIENT_KEYS.terms) === 'true',
    onboardingComplete: localStorage.getItem(CLIENT_KEYS.onboarding) === 'true',
    financialConsent: localStorage.getItem(CLIENT_KEYS.financialConsent) === 'true',
  }
}

export function acceptClientTerms() {
  if (!canUseStorage()) return
  localStorage.setItem(CLIENT_KEYS.terms, 'true')
}

export function completeClientOnboarding() {
  if (!canUseStorage()) return
  localStorage.setItem(CLIENT_KEYS.onboarding, 'true')
}

export function setFinancialConsent(value: boolean) {
  if (!canUseStorage()) return
  localStorage.setItem(CLIENT_KEYS.financialConsent, value ? 'true' : 'false')
}

export async function logoutClient(): Promise<void> {
  if (!canUseStorage()) return
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
  } catch {
    /* ignore */
  }
  Object.values(CLIENT_KEYS).forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userName')
  localStorage.removeItem('userRole')
}

function clearClientLists() {
  localStorage.removeItem(CLIENT_KEYS.favorites)
  localStorage.removeItem(CLIENT_KEYS.compare)
  localStorage.removeItem(CLIENT_KEYS.discarded)
  localStorage.removeItem(CLIENT_KEYS.viewed)
  localStorage.removeItem(CLIENT_KEYS.qualification)
  localStorage.removeItem(CLIENT_KEYS.profileJson)
  localStorage.removeItem(CLIENT_KEYS.financial)
  localStorage.removeItem(CLIENT_KEYS.terms)
  localStorage.removeItem(CLIENT_KEYS.onboarding)
  localStorage.removeItem(CLIENT_KEYS.financialConsent)
}

function readIdList(key: string): string[] {
  if (!canUseStorage()) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeIdList(key: string, ids: string[]) {
  if (!canUseStorage()) return
  localStorage.setItem(key, JSON.stringify(ids))
}

export function getFavoriteIds(): string[] {
  return readIdList(CLIENT_KEYS.favorites)
}

export function toggleFavorite(propertyId: string): string[] {
  const current = getFavoriteIds()
  const next = current.includes(propertyId)
    ? current.filter((id) => id !== propertyId)
    : [...current, propertyId]
  writeIdList(CLIENT_KEYS.favorites, next)
  return next
}

export function getCompareIds(): string[] {
  return readIdList(CLIENT_KEYS.compare)
}

export function toggleCompare(propertyId: string): string[] {
  const current = getCompareIds()
  if (current.includes(propertyId)) {
    const next = current.filter((id) => id !== propertyId)
    writeIdList(CLIENT_KEYS.compare, next)
    return next
  }
  if (current.length >= 3) return current
  const next = [...current, propertyId]
  writeIdList(CLIENT_KEYS.compare, next)
  return next
}

export function getDiscardedIds(): string[] {
  return readIdList(CLIENT_KEYS.discarded)
}

export function discardProperty(propertyId: string): string[] {
  const favorites = getFavoriteIds().filter((id) => id !== propertyId)
  writeIdList(CLIENT_KEYS.favorites, favorites)
  const compare = getCompareIds().filter((id) => id !== propertyId)
  writeIdList(CLIENT_KEYS.compare, compare)
  const next = Array.from(new Set([...getDiscardedIds(), propertyId]))
  writeIdList(CLIENT_KEYS.discarded, next)
  return next
}

export function restoreDiscarded(propertyId: string): string[] {
  const next = getDiscardedIds().filter((id) => id !== propertyId)
  writeIdList(CLIENT_KEYS.discarded, next)
  return next
}

export function getViewedIds(): string[] {
  return readIdList(CLIENT_KEYS.viewed)
}

export function markViewed(propertyId: string): string[] {
  const next = [propertyId, ...getViewedIds().filter((id) => id !== propertyId)].slice(0, 20)
  writeIdList(CLIENT_KEYS.viewed, next)
  return next
}

export function saveJson<T>(key: 'qualification' | 'profile' | 'financial', value: T) {
  if (!canUseStorage()) return
  const map = {
    qualification: CLIENT_KEYS.qualification,
    profile: CLIENT_KEYS.profileJson,
    financial: CLIENT_KEYS.financial,
  }
  localStorage.setItem(map[key], JSON.stringify(value))
}

export function loadJson<T>(key: 'qualification' | 'profile' | 'financial', fallback: T): T {
  if (!canUseStorage()) return fallback
  const map = {
    qualification: CLIENT_KEYS.qualification,
    profile: CLIENT_KEYS.profileJson,
    financial: CLIENT_KEYS.financial,
  }
  try {
    const raw = localStorage.getItem(map[key])
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * UI gate — middleware já exige cookie. Cache só após sync com servidor.
 */
export function canAccessClientPortal(realtorSlug: string): boolean {
  if (!canUseStorage()) return false
  if (isAdminViewingClient()) return true
  const session = getClientSession()
  if (!session || session.realtorSlug !== realtorSlug) return false
  return isClientAuthenticated()
}

export function isAdminViewingClient(): boolean {
  if (!canUseStorage()) return false
  try {
    const raw = localStorage.getItem('ih_admin_profile')
    if (!raw) return false
    const parsed = JSON.parse(raw) as { realm?: string; role?: string }
    return (
      parsed.realm === 'admin' &&
      (parsed.role === 'super_admin' ||
        parsed.role === 'admin' ||
        parsed.role === 'suporte' ||
        parsed.role === 'financeiro')
    )
  } catch {
    return false
  }
}
