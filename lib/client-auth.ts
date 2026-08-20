export type UserRole = 'super_admin' | 'corretor' | 'cliente'

const CLIENT_KEYS = {
  auth: 'clientAuthenticated',
  email: 'clientEmail',
  name: 'clientName',
  phone: 'clientPhone',
  realtorSlug: 'clientRealtorSlug',
  realtorId: 'clientRealtorId',
  terms: 'clientTermsAccepted',
  onboarding: 'clientOnboardingComplete',
  financialConsent: 'clientFinancialConsent',
  qualification: 'clientQualification',
  favorites: 'clientFavorites',
  compare: 'clientCompare',
  discarded: 'clientDiscarded',
  viewed: 'clientViewed',
  profile: 'clientProfile',
  financial: 'clientFinancial',
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

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function loginClient(params: {
  email: string
  password: string
  realtorSlug: string
  realtorId: number
  name?: string
  phone?: string
}): boolean {
  if (!canUseStorage()) return false
  if (!params.email || !params.password) return false

  const existingSlug = localStorage.getItem(CLIENT_KEYS.realtorSlug)
  if (existingSlug && existingSlug !== params.realtorSlug) {
    // Troca de corretor = nova sessão isolada
    clearClientLists()
  }

  localStorage.setItem(CLIENT_KEYS.auth, 'true')
  localStorage.setItem(CLIENT_KEYS.email, params.email)
  localStorage.setItem(CLIENT_KEYS.name, params.name || params.email.split('@')[0])
  localStorage.setItem(CLIENT_KEYS.phone, params.phone || '')
  localStorage.setItem(CLIENT_KEYS.realtorSlug, params.realtorSlug)
  localStorage.setItem(CLIENT_KEYS.realtorId, String(params.realtorId))
  localStorage.setItem('userRole', 'cliente')
  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('userEmail', params.email)
  localStorage.setItem('userName', params.name || params.email.split('@')[0])
  return true
}

export function isClientAuthenticated(): boolean {
  if (!canUseStorage()) return false
  return localStorage.getItem(CLIENT_KEYS.auth) === 'true'
}

export function getClientSession(): ClientSession | null {
  if (!isClientAuthenticated()) return null
  return {
    email: localStorage.getItem(CLIENT_KEYS.email) || '',
    name: localStorage.getItem(CLIENT_KEYS.name) || '',
    phone: localStorage.getItem(CLIENT_KEYS.phone) || '',
    realtorSlug: localStorage.getItem(CLIENT_KEYS.realtorSlug) || '',
    realtorId: Number(localStorage.getItem(CLIENT_KEYS.realtorId) || 0),
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

export function logoutClient() {
  if (!canUseStorage()) return
  Object.values(CLIENT_KEYS).forEach((key) => localStorage.removeItem(key))
  if (localStorage.getItem('userRole') === 'cliente') {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
  }
}

function clearClientLists() {
  localStorage.removeItem(CLIENT_KEYS.favorites)
  localStorage.removeItem(CLIENT_KEYS.compare)
  localStorage.removeItem(CLIENT_KEYS.discarded)
  localStorage.removeItem(CLIENT_KEYS.viewed)
  localStorage.removeItem(CLIENT_KEYS.qualification)
  localStorage.removeItem(CLIENT_KEYS.profile)
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
    profile: CLIENT_KEYS.profile,
    financial: CLIENT_KEYS.financial,
  }
  localStorage.setItem(map[key], JSON.stringify(value))
}

export function loadJson<T>(key: 'qualification' | 'profile' | 'financial', fallback: T): T {
  if (!canUseStorage()) return fallback
  const map = {
    qualification: CLIENT_KEYS.qualification,
    profile: CLIENT_KEYS.profile,
    financial: CLIENT_KEYS.financial,
  }
  try {
    const raw = localStorage.getItem(map[key])
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** Super Admin pode inspecionar qualquer área de cliente sem sessão cliente. */
export function canAccessClientPortal(realtorSlug: string): boolean {
  if (!canUseStorage()) return false
  if (localStorage.getItem('userRole') === 'super_admin' && localStorage.getItem('isAuthenticated') === 'true') {
    return true
  }
  const session = getClientSession()
  return Boolean(session && session.realtorSlug === realtorSlug)
}

export function isAdminViewingClient(): boolean {
  if (!canUseStorage()) return false
  return localStorage.getItem('userRole') === 'super_admin' && localStorage.getItem('isAuthenticated') === 'true'
}
