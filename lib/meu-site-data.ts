/**
 * Meu Site — vitrine automática incluída na assinatura (não é a Página Premium R$ 497).
 * Dados em localStorage; isolamento por realtorId.
 */

import { getCurrentRealtorId } from '@/lib/phase7-data'
import {
  PublicRealtorProfile,
  getPublicRealtorBySlug,
  publicRealtorProfiles,
  slugifyTitle,
} from '@/lib/phase9-data'
import { propertiesList } from '@/lib/mock-data'
import { recordAccessLog } from '@/lib/access-logs'

const SETTINGS_KEY = 'imovelhub_meu_site_settings'
const PUBLISH_KEY = 'imovelhub_site_publish'
const ANALYTICS_KEY = 'imovelhub_site_analytics'
const LEADS_KEY = 'imovelhub_site_leads'
const EXTRA_PROPS_KEY = 'imovelhub_site_extra_properties'
const ARCHIVE_KEY = 'imovelhub_site_archived_ids'

export type SitePublishChoice = 'yes' | 'no' | 'draft'

export interface MeuSiteSettings {
  realtorId: number
  slug: string
  active: boolean
  showAddress: boolean
  showPrices: boolean
  allowSignup: boolean
  allowProposal: boolean
  allowVisit: boolean
  allowWhatsApp: boolean
  heroTitle: string
  heroText: string
  bio: string
  creci: string
  whatsapp: string
  photo: string
  coverImage: string
  specialties: string[]
  regions: string[]
  social: {
    instagram: string
    facebook: string
    linkedin: string
  }
  featuredPropertyIds: string[]
  seoTitle: string
  seoDescription: string
}

export interface SiteLead {
  id: string
  realtorId: number
  name: string
  email: string
  phone: string
  source: string
  createdAt: string
  preferences?: Record<string, string>
}

export interface SiteAnalytics {
  realtorId: number
  views: number
  leads: number
  signups: number
  propertyViews: { id: string; title: string; views: number }[]
}

function loadMap<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as Record<string, T>) : {}
  } catch {
    return {}
  }
}

function saveMap<T>(key: string, map: Record<string, T>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(map))
}

export function getDefaultSiteSettings(realtorId: number): MeuSiteSettings {
  const profile =
    publicRealtorProfiles.find((p) => p.id === realtorId) || publicRealtorProfiles[0]
  return {
    realtorId,
    slug: profile?.slug || 'corretor-demonstracao',
    active: true,
    showAddress: true,
    showPrices: true,
    allowSignup: true,
    allowProposal: true,
    allowVisit: true,
    allowWhatsApp: true,
    heroTitle: profile?.promise || 'Encontre o imóvel ideal comigo',
    heroText: profile?.bio?.slice(0, 180) || '',
    bio: profile?.bio || '',
    creci: profile?.creci || '',
    whatsapp: profile?.whatsapp || '',
    photo: profile?.photo || '',
    coverImage: profile?.coverImage || '',
    specialties: profile?.specialties || [],
    regions: profile?.regions || [],
    social: {
      instagram: profile?.social?.instagram || '',
      facebook: profile?.social?.facebook || '',
      linkedin: profile?.social?.linkedin || '',
    },
    featuredPropertyIds: [],
    seoTitle: `${profile?.name || 'Corretor'} | Imóveis`,
    seoDescription: profile?.promise || 'Vitrine de imóveis do corretor',
  }
}

export function getMeuSiteSettings(realtorId?: number | null): MeuSiteSettings {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const map = loadMap<MeuSiteSettings>(SETTINGS_KEY)
  return map[String(id)] || getDefaultSiteSettings(id)
}

export function saveMeuSiteSettings(settings: MeuSiteSettings) {
  const map = loadMap<MeuSiteSettings>(SETTINGS_KEY)
  map[String(settings.realtorId)] = settings
  saveMap(SETTINGS_KEY, map)
}

export function getSitePublicUrl(slug: string, path = ''): string {
  if (typeof window === 'undefined') return `/${slug}${path}`
  return `${window.location.origin}/${slug}${path}`
}

export function getSiteCorretorUrl(slug: string, path = ''): string {
  if (typeof window === 'undefined') return `/corretor/${slug}${path}`
  return `${window.location.origin}/corretor/${slug}${path}`
}

export function getPublishMap(): Record<string, SitePublishChoice> {
  return loadMap<SitePublishChoice>(PUBLISH_KEY)
}

export function setPropertySitePublish(propertyKey: string, choice: SitePublishChoice) {
  const map = getPublishMap()
  map[propertyKey] = choice
  saveMap(PUBLISH_KEY, map)
}

export function getPropertySitePublish(propertyKey: string): SitePublishChoice {
  return getPublishMap()[propertyKey] || 'yes'
}

/** Imóveis elegíveis à vitrine (publicados no site, não rascunho/arquivado) */
export function isPropertyVisibleOnSite(property: {
  id: string | number
  status?: string
  realtorId?: number
}): boolean {
  const key = String(property.id).replace(/^mock-/, '')
  const choice = getPropertySitePublish(key)
  if (choice === 'no' || choice === 'draft') return false
  if (isPropertyArchived(property.id)) return false
  const status = property.status || 'available'
  if (
    status === 'draft' ||
    status === 'under_review' ||
    status === 'sold' ||
    status === 'unavailable' ||
    status === 'archived'
  ) {
    return false
  }
  return choice === 'yes'
}

export function isPropertyArchived(propertyId: string | number): boolean {
  if (typeof window === 'undefined') return false
  const map = loadMap<boolean>(ARCHIVE_KEY)
  const key = String(propertyId).replace(/^mock-/, '')
  return !!map[key] || !!map[String(propertyId)]
}

export function setPropertyArchived(propertyId: string | number, archived: boolean) {
  const map = loadMap<boolean>(ARCHIVE_KEY)
  const key = String(propertyId).replace(/^mock-/, '')
  if (archived) {
    map[key] = true
    setPropertySitePublish(key, 'no')
  } else {
    delete map[key]
  }
  saveMap(ARCHIVE_KEY, map)
}

export interface SiteExtraProperty {
  id: string
  slug: string
  realtorId: number
  title: string
  address: string
  neighborhood: string
  city: string
  price: number
  purpose: 'venda' | 'aluguel' | 'lancamento'
  featured: boolean
  status: string
  bedrooms: number
  bathrooms: number
  area: number
  garage: number
  image: string
  description: string
}

export function getExtraSiteProperties(realtorId?: number): SiteExtraProperty[] {
  const all = loadMap<SiteExtraProperty>(EXTRA_PROPS_KEY)
  const list = Object.values(all)
  if (realtorId == null) return list
  return list.filter((p) => p.realtorId === realtorId)
}

export function addExtraSiteProperty(
  data: Omit<SiteExtraProperty, 'id' | 'slug' | 'featured' | 'status'> & {
    status?: string
    publish: SitePublishChoice
  }
): SiteExtraProperty {
  const id = `site-${Date.now()}`
  const slug = slugifyTitle(data.title) || id
  const entry: SiteExtraProperty = {
    id,
    slug,
    realtorId: data.realtorId,
    title: data.title,
    address: data.address,
    neighborhood: data.neighborhood || data.address.split(',')[0] || '',
    city: data.city || 'São Paulo',
    price: data.price,
    purpose: data.purpose,
    featured: false,
    status: data.publish === 'yes' ? 'available' : data.publish === 'draft' ? 'draft' : 'unavailable',
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area: data.area,
    garage: data.garage,
    image:
      data.image ||
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    description: data.description,
  }
  const map = loadMap<SiteExtraProperty>(EXTRA_PROPS_KEY)
  map[id] = entry
  saveMap(EXTRA_PROPS_KEY, map)
  setPropertySitePublish(id, data.publish)
  return entry
}

export function getSiteAnalytics(realtorId?: number | null): SiteAnalytics {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const map = loadMap<SiteAnalytics>(ANALYTICS_KEY)
  if (map[String(id)]) return map[String(id)]
  return {
    realtorId: id,
    views: 0,
    leads: 0,
    signups: 0,
    propertyViews: [],
  }
}

export function bumpSiteView(realtorId: number) {
  const map = loadMap<SiteAnalytics>(ANALYTICS_KEY)
  const current = map[String(realtorId)] || getSiteAnalytics(realtorId)
  current.views += 1
  map[String(realtorId)] = current
  saveMap(ANALYTICS_KEY, map)
  recordAccessLog({
    action: 'site_view',
    realtorId,
    source: 'vitrine-publica',
  })
}

export function addSiteLead(lead: Omit<SiteLead, 'id' | 'createdAt'>) {
  if (typeof window === 'undefined') return
  const list = loadMap<SiteLead[]>(LEADS_KEY)
  const key = String(lead.realtorId)
  const arr = list[key] || []
  const entry: SiteLead = {
    ...lead,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  arr.unshift(entry)
  list[key] = arr.slice(0, 50)
  saveMap(LEADS_KEY, list)

  const analytics = loadMap<SiteAnalytics>(ANALYTICS_KEY)
  const a = analytics[key] || getSiteAnalytics(lead.realtorId)
  a.leads += 1
  if (lead.source.includes('cadastro') || lead.source.includes('encontrar')) a.signups += 1
  analytics[key] = a
  saveMap(ANALYTICS_KEY, analytics)

  recordAccessLog({
    action: 'lead_submit',
    realtorId: lead.realtorId,
    leadId: entry.id,
    leadName: lead.name,
    leadEmail: lead.email,
    leadPhone: lead.phone,
    source: lead.source,
    detail: lead.preferences ? JSON.stringify(lead.preferences).slice(0, 280) : undefined,
  })

  // Espelha no CRM local do corretor (clientes)
  try {
    const crmKey = 'imovelhub_crm_leads'
    const raw = localStorage.getItem(crmKey)
    const crm = raw ? JSON.parse(raw) : []
    crm.unshift({
      id: entry.id,
      realtorId: lead.realtorId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: `Site · ${lead.source}`,
      status: 'novo',
      createdAt: entry.createdAt,
    })
    localStorage.setItem(crmKey, JSON.stringify(crm.slice(0, 100)))
  } catch {
    /* ignore */
  }
}

/** Todos os leads de todas as carteiras (visão Super Admin) */
export function getAllSiteLeads(): SiteLead[] {
  const list = loadMap<SiteLead[]>(LEADS_KEY)
  return Object.values(list)
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getSiteLeads(realtorId?: number | null): SiteLead[] {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const list = loadMap<SiteLead[]>(LEADS_KEY)
  return list[String(id)] || []
}

export function applySettingsToProfile(profile: PublicRealtorProfile): PublicRealtorProfile {
  const s = getMeuSiteSettings(profile.id)
  return {
    ...profile,
    slug: s.slug || profile.slug,
    creci: s.creci || profile.creci,
    bio: s.bio || profile.bio,
    promise: s.heroTitle || profile.promise,
    photo: s.photo || profile.photo,
    coverImage: s.coverImage || profile.coverImage,
    whatsapp: s.whatsapp || profile.whatsapp,
    specialties: s.specialties.length ? s.specialties : profile.specialties,
    regions: s.regions.length ? s.regions : profile.regions,
    social: {
      ...profile.social,
      instagram: s.social.instagram || profile.social.instagram,
      facebook: s.social.facebook || profile.social.facebook,
      linkedin: s.social.linkedin || profile.social.linkedin,
    },
  }
}

export function resolvePublicProfileBySlug(slug: string): PublicRealtorProfile | undefined {
  const staticMatch = getPublicRealtorBySlug(slug)
  if (typeof window === 'undefined') {
    return staticMatch
  }
  // Slug personalizado salvo no Meu Site
  const settingsMap = loadMap<MeuSiteSettings>(SETTINGS_KEY)
  const byCustom = Object.values(settingsMap).find((s) => s.slug === slug)
  if (byCustom) {
    const base =
      publicRealtorProfiles.find((p) => p.id === byCustom.realtorId) || staticMatch
    if (!base) return undefined
    if (!byCustom.active) return undefined
    return applySettingsToProfile({ ...base, slug: byCustom.slug })
  }
  if (!staticMatch) return undefined
  const settings = getMeuSiteSettings(staticMatch.id)
  if (!settings.active) return undefined
  return applySettingsToProfile(staticMatch)
}

export function getMergedPublicProfile(slug: string): PublicRealtorProfile | undefined {
  return resolvePublicProfileBySlug(slug)
}

export function ensureAutoSiteForRealtor(realtorId: number, name: string): MeuSiteSettings {
  const existing = loadMap<MeuSiteSettings>(SETTINGS_KEY)[String(realtorId)]
  if (existing) return existing
  const settings = getDefaultSiteSettings(realtorId)
  settings.slug = slugifyTitle(name) || settings.slug
  saveMeuSiteSettings(settings)
  return settings
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  return Promise.reject(new Error('clipboard unavailable'))
}

export function whatsappShareUrl(text: string, phone?: string): string {
  const q = encodeURIComponent(text)
  if (phone) return `https://wa.me/${phone.replace(/\D/g, '')}?text=${q}`
  return `https://wa.me/?text=${q}`
}

export { slugifyTitle }
