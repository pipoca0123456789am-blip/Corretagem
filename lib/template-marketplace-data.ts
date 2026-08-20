/**
 * Marketplace de Templates Profissionais + Domínios
 * Protótipo: localStorage (sem SQL). Schema espelha tabelas futuras.
 * NÃO confundir com Meu Site (assinatura) nem Página Premium R$ 497.
 */

import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getMeuSiteSettings } from '@/lib/meu-site-data'

const CATALOG_KEY = 'imovelhub_page_templates_v1'
const CATEGORIES_KEY = 'imovelhub_template_categories_v1'
const SUBS_KEY = 'imovelhub_broker_template_subs_v1'
const CUSTOM_KEY = 'imovelhub_broker_template_custom_v1'
const DOMAIN_CONN_KEY = 'imovelhub_broker_domains_v1'
const DOMAIN_ORDERS_KEY = 'imovelhub_domain_orders_v1'
const DOMAIN_SEARCH_KEY = 'imovelhub_domain_searches_v1'
const METRICS_KEY = 'imovelhub_template_metrics_v1'
const CONFIG_KEY = 'imovelhub_template_marketplace_config_v1'
const HISTORY_KEY = 'imovelhub_template_history_v1'

/** Preço configurável — não espalhar no código. */
export interface MarketplaceConfig {
  templatePrice: number
  templateDurationMonths: number
  domainServiceFeeFrom: number
  currency: string
  provisionalPrices: boolean
  onExpireFallback: 'basic_site'
  alertDays: number[]
}

export const defaultMarketplaceConfig: MarketplaceConfig = {
  templatePrice: 97,
  templateDurationMonths: 2,
  domainServiceFeeFrom: 69.9,
  currency: 'BRL',
  provisionalPrices: true,
  onExpireFallback: 'basic_site',
  alertDays: [15, 7, 3, 0],
}

export type TemplateStatus = 'draft' | 'review' | 'active' | 'paused' | 'deprecated' | 'archived'
export type TemplateBadge =
  | 'novo'
  | 'mais_escolhido'
  | 'recomendado'
  | 'alto_padrao'
  | 'exclusivo'
  | 'melhor_conversao'

export type TemplateSubscriptionStatus =
  | 'preview'
  | 'checkout_started'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'activation_pending'
  | 'active'
  | 'expiring'
  | 'expired'
  | 'renewal_pending'
  | 'cancelled'
  | 'suspended'

export type DomainConnectionStatus =
  | 'not_started'
  | 'awaiting_configuration'
  | 'awaiting_dns'
  | 'validating'
  | 'connected'
  | 'ssl_pending'
  | 'active'
  | 'configuration_error'
  | 'suspended'
  | 'disconnected'

export type DomainOrderStatus =
  | 'search'
  | 'selected'
  | 'checkout_started'
  | 'payment_pending'
  | 'manual_processing'
  | 'registered'
  | 'failed'
  | 'cancelled'

export interface TemplateCategory {
  id: string
  name: string
  slug: string
  sortOrder: number
  active: boolean
}

export interface PageTemplate {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  style: string
  version: string
  thumbnail: string
  status: TemplateStatus
  badge?: TemplateBadge
  basePrice?: number
  durationMonths?: number
  featured: boolean
  responsive: boolean
  desktopReady: boolean
  mobileReady: boolean
  sections: string[]
  features: string[]
  customizationKeys: string[]
  themeTokens: {
    primary: string
    accent: string
    background: string
    foreground: string
    fontDisplay: string
    fontBody: string
  }
  supportedPlans: Array<'essencial' | 'profissional' | 'premium' | 'all'>
  exclusive: boolean
  createdAt: string
  updatedAt: string
}

export interface BrokerTemplateSubscription {
  id: string
  realtorId: number
  templateId: string
  templateVersion: string
  status: TemplateSubscriptionStatus
  price: number
  currency: string
  durationMonths: number
  orderedAt: string
  confirmedAt?: string
  activatedAt?: string
  startedAt?: string
  expiresAt?: string
  renewalType: 'manual' | 'auto'
  history: { id: string; label: string; at: string }[]
}

export interface BrokerTemplateCustomization {
  realtorId: number
  templateSubscriptionId?: string
  draft: Record<string, unknown>
  published: Record<string, unknown>
  publishedAt?: string
  updatedAt: string
}

export interface DomainConnection {
  id: string
  realtorId: number
  domain: string
  connectionType: 'existing' | 'purchased'
  provider: 'manual'
  status: DomainConnectionStatus
  verificationToken: string
  sslStatus: 'none' | 'pending' | 'active' | 'error'
  dnsHints: { type: string; host: string; value: string }[]
  verifiedAt?: string
  activatedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface DomainOrder {
  id: string
  realtorId: number
  domain: string
  extension: string
  provider: 'manual'
  status: DomainOrderStatus
  registrationPrice: number
  serviceFee: number
  renewalPrice: number
  currency: string
  registrationPeriodYears: number
  orderedAt: string
  registeredAt?: string
  expiresAt?: string
  notes?: string
}

export interface DomainSearchResult {
  domain: string
  extension: string
  available: boolean
  registrationPrice: number
  renewalPrice: number
  serviceFee: number
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getMarketplaceConfig(): MarketplaceConfig {
  return { ...defaultMarketplaceConfig, ...loadJSON(CONFIG_KEY, {}) }
}

export function saveMarketplaceConfig(partial: Partial<MarketplaceConfig>) {
  const next = { ...getMarketplaceConfig(), ...partial }
  saveJSON(CONFIG_KEY, next)
  return next
}

export function getTemplatePrice(template?: PageTemplate | null): number {
  const cfg = getMarketplaceConfig()
  if (template?.basePrice != null) return template.basePrice
  return cfg.templatePrice
}

export function getTemplateDuration(template?: PageTemplate | null): number {
  const cfg = getMarketplaceConfig()
  if (template?.durationMonths != null) return template.durationMonths
  return cfg.templateDurationMonths
}

export const defaultCategories: TemplateCategory[] = [
  { id: 'cat-moderno', name: 'Moderno', slug: 'moderno', sortOrder: 1, active: true },
  { id: 'cat-minimal', name: 'Minimalista', slug: 'minimalista', sortOrder: 2, active: true },
  { id: 'cat-alto', name: 'Alto Padrão', slug: 'alto-padrao', sortOrder: 3, active: true },
  { id: 'cat-luxo', name: 'Luxo', slug: 'luxo', sortOrder: 4, active: true },
  { id: 'cat-casas', name: 'Casas e Condomínios', slug: 'casas-condominios', sortOrder: 5, active: true },
  { id: 'cat-apto', name: 'Apartamentos', slug: 'apartamentos', sortOrder: 6, active: true },
  { id: 'cat-lanc', name: 'Lançamentos', slug: 'lancamentos', sortOrder: 7, active: true },
  { id: 'cat-inv', name: 'Investimentos', slug: 'investimentos', sortOrder: 8, active: true },
  { id: 'cat-com', name: 'Comercial', slug: 'comercial', sortOrder: 9, active: true },
  { id: 'cat-rural', name: 'Rural', slug: 'rural', sortOrder: 10, active: true },
  { id: 'cat-classico', name: 'Imobiliário Clássico', slug: 'classico', sortOrder: 11, active: true },
]

const sharedSections = [
  'header',
  'hero',
  'search',
  'featured_properties',
  'all_properties',
  'about',
  'testimonials',
  'lead_form',
  'contact',
  'footer',
]

const sharedFeatures = [
  'Imóveis automáticos do corretor',
  'Páginas individuais',
  'Formulário de captação',
  'WhatsApp',
  'Responsivo',
  'Integração CRM',
]

function tpl(
  partial: Omit<PageTemplate, 'createdAt' | 'updatedAt' | 'version' | 'desktopReady' | 'mobileReady' | 'supportedPlans'> &
    Partial<Pick<PageTemplate, 'version' | 'desktopReady' | 'mobileReady' | 'supportedPlans'>>
): PageTemplate {
  const now = '2026-08-05'
  return {
    version: '1.0.0',
    desktopReady: true,
    mobileReady: true,
    supportedPlans: ['all'],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

export const defaultTemplates: PageTemplate[] = [
  tpl({
    id: 'tpl-modern-horizon',
    name: 'Modern Horizon',
    slug: 'modern-horizon',
    description: 'Layout limpo com hero fotográfico e busca rápida — ideal para corretores urbanos.',
    categoryId: 'cat-moderno',
    style: 'Moderno contemporâneo',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
    status: 'active',
    badge: 'recomendado',
    featured: true,
    responsive: true,
    sections: sharedSections,
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'heroSubtitle', 'primaryColor', 'photo', 'cover', 'whatsapp'],
    themeTokens: {
      primary: '#0f766e',
      accent: '#f59e0b',
      background: '#f8fafc',
      foreground: '#0f172a',
      fontDisplay: 'Georgia, serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-minimal-line',
    name: 'Minimal Line',
    slug: 'minimal-line',
    description: 'Tipografia forte, poucos elementos e foco em conversão por WhatsApp.',
    categoryId: 'cat-minimal',
    style: 'Minimalista',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop',
    status: 'active',
    badge: 'novo',
    featured: true,
    responsive: true,
    sections: ['header', 'hero', 'featured_properties', 'about', 'lead_form', 'footer'],
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'primaryColor', 'photo', 'whatsapp'],
    themeTokens: {
      primary: '#111827',
      accent: '#2563eb',
      background: '#ffffff',
      foreground: '#111827',
      fontDisplay: 'system-ui, sans-serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-classic-estate',
    name: 'Classic Estate',
    slug: 'classic-estate',
    description: 'Visual clássico imobiliário com seções tradicionais e credibilidade.',
    categoryId: 'cat-classico',
    style: 'Clássico',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop',
    status: 'active',
    badge: 'mais_escolhido',
    featured: true,
    responsive: true,
    sections: sharedSections,
    features: [...sharedFeatures, 'Depoimentos em destaque'],
    customizationKeys: ['heroTitle', 'heroSubtitle', 'bio', 'photo', 'cover', 'creci'],
    themeTokens: {
      primary: '#7c2d12',
      accent: '#a16207',
      background: '#fffbeb',
      foreground: '#1c1917',
      fontDisplay: 'Georgia, serif',
      fontBody: 'Georgia, serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-luxury-atelier',
    name: 'Luxury Atelier',
    slug: 'luxury-atelier',
    description: 'Composição sofisticada para alto padrão e imóveis de luxo.',
    categoryId: 'cat-luxo',
    style: 'Luxo',
    thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop',
    status: 'active',
    badge: 'alto_padrao',
    featured: true,
    responsive: true,
    sections: sharedSections,
    features: [...sharedFeatures, 'Galeria cinematic', 'CTA exclusivos'],
    customizationKeys: ['heroTitle', 'primaryColor', 'accentColor', 'photo', 'cover', 'video'],
    themeTokens: {
      primary: '#1e1b4b',
      accent: '#c4b5fd',
      background: '#0f0a1a',
      foreground: '#f5f3ff',
      fontDisplay: 'Georgia, serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: true,
    supportedPlans: ['profissional', 'premium'],
  }),
  tpl({
    id: 'tpl-launch-pulse',
    name: 'Launch Pulse',
    slug: 'launch-pulse',
    description: 'Foco em lançamentos, filas de interesse e captação rápida.',
    categoryId: 'cat-lanc',
    style: 'Lançamentos',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop',
    status: 'active',
    badge: 'melhor_conversao',
    featured: false,
    responsive: true,
    sections: sharedSections,
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'heroSubtitle', 'whatsapp', 'cover'],
    themeTokens: {
      primary: '#0369a1',
      accent: '#f97316',
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      fontDisplay: 'system-ui, sans-serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-condo-grove',
    name: 'Condo Grove',
    slug: 'condo-grove',
    description: 'Casas e condomínios com ênfase em família e bairros.',
    categoryId: 'cat-casas',
    style: 'Residencial',
    thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop',
    status: 'active',
    featured: false,
    responsive: true,
    sections: sharedSections,
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'regions', 'photo', 'whatsapp'],
    themeTokens: {
      primary: '#166534',
      accent: '#ca8a04',
      background: '#f0fdf4',
      foreground: '#14532d',
      fontDisplay: 'Georgia, serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-invest-grid',
    name: 'Invest Grid',
    slug: 'invest-grid',
    description: 'Grade objetiva para investidores: rentabilidade e filtros claros.',
    categoryId: 'cat-inv',
    style: 'Investimentos',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop',
    status: 'active',
    featured: false,
    responsive: true,
    sections: sharedSections,
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'primaryColor', 'whatsapp'],
    themeTokens: {
      primary: '#1e3a8a',
      accent: '#059669',
      background: '#eff6ff',
      foreground: '#1e3a8a',
      fontDisplay: 'system-ui, sans-serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-rural-vista',
    name: 'Rural Vista',
    slug: 'rural-vista',
    description: 'Atmosfera ampla para sítios, fazendas e propriedades rurais.',
    categoryId: 'cat-rural',
    style: 'Rural',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop',
    status: 'active',
    featured: false,
    responsive: true,
    sections: sharedSections,
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'cover', 'regions', 'whatsapp'],
    themeTokens: {
      primary: '#3f6212',
      accent: '#b45309',
      background: '#fefce8',
      foreground: '#365314',
      fontDisplay: 'Georgia, serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-commercial-hub',
    name: 'Commercial Hub',
    slug: 'commercial-hub',
    description: 'Salas, lojas e galpões com linguagem corporativa.',
    categoryId: 'cat-com',
    style: 'Comercial',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop',
    status: 'active',
    featured: false,
    responsive: true,
    sections: sharedSections,
    features: sharedFeatures,
    customizationKeys: ['heroTitle', 'primaryColor', 'whatsapp', 'email'],
    themeTokens: {
      primary: '#334155',
      accent: '#0ea5e9',
      background: '#f8fafc',
      foreground: '#0f172a',
      fontDisplay: 'system-ui, sans-serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: false,
  }),
  tpl({
    id: 'tpl-prestige-suite',
    name: 'Prestige Suite',
    slug: 'prestige-suite',
    description: 'Template exclusivo Premium com seções avançadas de autoridade.',
    categoryId: 'cat-alto',
    style: 'Alto padrão exclusivo',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
    status: 'active',
    badge: 'exclusivo',
    featured: true,
    responsive: true,
    sections: sharedSections,
    features: [...sharedFeatures, 'Seções exclusivas Premium'],
    customizationKeys: ['heroTitle', 'heroSubtitle', 'primaryColor', 'photo', 'cover', 'video', 'testimonials'],
    themeTokens: {
      primary: '#422006',
      accent: '#d4a574',
      background: '#1c1917',
      foreground: '#fafaf9',
      fontDisplay: 'Georgia, serif',
      fontBody: 'system-ui, sans-serif',
    },
    exclusive: true,
    supportedPlans: ['premium'],
  }),
]

export function loadCategories(): TemplateCategory[] {
  const stored = loadJSON(CATEGORIES_KEY, null as TemplateCategory[] | null)
  if (!stored || !Array.isArray(stored) || stored.length === 0) return defaultCategories
  // Mescla categorias novas do seed (ex.: Apartamentos) sem apagar edições do admin
  const byId = new Map(stored.map((c) => [c.id, c]))
  defaultCategories.forEach((seed) => {
    if (!byId.has(seed.id)) byId.set(seed.id, seed)
  })
  return Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function saveCategories(list: TemplateCategory[]) {
  saveJSON(CATEGORIES_KEY, list)
}

export function loadTemplates(): PageTemplate[] {
  return loadJSON(CATALOG_KEY, defaultTemplates)
}

export function saveTemplates(list: PageTemplate[]) {
  saveJSON(CATALOG_KEY, list)
}

export function getActiveTemplates(): PageTemplate[] {
  return loadTemplates().filter((t) => t.status === 'active')
}

export function getTemplateById(id: string): PageTemplate | undefined {
  return loadTemplates().find((t) => t.id === id)
}

export function getTemplateBySlug(slug: string): PageTemplate | undefined {
  return loadTemplates().find((t) => t.slug === slug)
}

export function loadTemplateSubscriptions(): BrokerTemplateSubscription[] {
  return loadJSON(SUBS_KEY, [] as BrokerTemplateSubscription[])
}

export function saveTemplateSubscriptions(list: BrokerTemplateSubscription[]) {
  saveJSON(SUBS_KEY, list)
}

export function getBrokerTemplateSubscription(
  realtorId?: number | null
): BrokerTemplateSubscription | null {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const list = loadTemplateSubscriptions()
    .filter((s) => s.realtorId === id)
    .sort((a, b) => (b.activatedAt || b.orderedAt).localeCompare(a.activatedAt || a.orderedAt))
  return list[0] || null
}

export function getActiveBrokerTemplate(realtorId?: number | null): {
  subscription: BrokerTemplateSubscription
  template: PageTemplate
} | null {
  const sub = getBrokerTemplateSubscription(realtorId)
  if (!sub) return null
  refreshSubscriptionExpiry(sub)
  if (sub.status !== 'active' && sub.status !== 'expiring') return null
  const template = getTemplateById(sub.templateId)
  if (!template || template.status !== 'active') return null
  return { subscription: sub, template }
}

export function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null
  const ms = new Date(dateIso).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function refreshSubscriptionExpiry(sub: BrokerTemplateSubscription): BrokerTemplateSubscription {
  if (!sub.expiresAt) return sub
  const days = daysUntil(sub.expiresAt)
  if (days == null) return sub
  let next = sub.status
  if (days < 0 && sub.status !== 'expired' && sub.status !== 'cancelled') next = 'expired'
  else if (days <= 7 && (sub.status === 'active' || sub.status === 'expiring')) next = 'expiring'
  if (next !== sub.status) {
    sub.status = next
    const list = loadTemplateSubscriptions()
    const idx = list.findIndex((s) => s.id === sub.id)
    if (idx >= 0) {
      list[idx] = sub
      saveTemplateSubscriptions(list)
    }
    if (next === 'expired') {
      pushTemplateHistory(sub.realtorId, `Template expirado — retorno ao Meu Site básico`)
    }
  }
  return sub
}

export function startTemplateCheckout(templateId: string, realtorId?: number): BrokerTemplateSubscription {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  assertBrokerOwnership(id)
  const template = getTemplateById(templateId)
  if (!template || template.status !== 'active') {
    throw new Error('Template indisponível para contratação.')
  }
  const price = getTemplatePrice(template)
  const duration = getTemplateDuration(template)
  const now = new Date().toISOString()
  const sub: BrokerTemplateSubscription = {
    id: `bts-${Date.now()}`,
    realtorId: id,
    templateId: template.id,
    templateVersion: template.version,
    status: 'checkout_started',
    price,
    currency: getMarketplaceConfig().currency,
    durationMonths: duration,
    orderedAt: now,
    renewalType: 'manual',
    history: [{ id: `h-${Date.now()}`, label: 'Checkout iniciado', at: now.slice(0, 10) }],
  }
  const list = loadTemplateSubscriptions()
  list.unshift(sub)
  saveTemplateSubscriptions(list)
  trackTemplateEvent('template_checkout_started', { templateId, realtorId: id })
  return sub
}

/** Confirma pagamento simulado e ativa (preço sempre do backend/config). */
export function confirmTemplatePayment(subscriptionId: string, clientClaimedPrice?: number): BrokerTemplateSubscription {
  const list = loadTemplateSubscriptions()
  const sub = list.find((s) => s.id === subscriptionId)
  if (!sub) throw new Error('Pedido não encontrado')
  const template = getTemplateById(sub.templateId)
  const official = getTemplatePrice(template)
  // Ignora preço manipulado no frontend
  if (clientClaimedPrice != null && clientClaimedPrice !== official) {
    sub.history.unshift({
      id: `h-${Date.now()}`,
      label: `Preço do cliente ignorado (${clientClaimedPrice}) — aplicado ${official}`,
      at: new Date().toISOString().slice(0, 10),
    })
  }
  sub.price = official
  sub.status = 'payment_confirmed'
  sub.confirmedAt = new Date().toISOString()
  saveTemplateSubscriptions(list)
  return activateTemplateSubscription(subscriptionId)
}

export function activateTemplateSubscription(subscriptionId: string): BrokerTemplateSubscription {
  const list = loadTemplateSubscriptions()
  const sub = list.find((s) => s.id === subscriptionId)
  if (!sub) throw new Error('Pedido não encontrado')
  const template = getTemplateById(sub.templateId)
  const duration = getTemplateDuration(template)
  const start = new Date()
  const end = new Date(start)
  end.setMonth(end.getMonth() + duration)

  // Expira anterior ativa
  list.forEach((s) => {
    if (s.realtorId === sub.realtorId && s.id !== sub.id && (s.status === 'active' || s.status === 'expiring')) {
      s.status = 'cancelled'
      s.history.unshift({
        id: `h-${Date.now()}`,
        label: 'Substituído por novo template',
        at: start.toISOString().slice(0, 10),
      })
    }
  })

  sub.status = 'active'
  sub.activatedAt = start.toISOString()
  sub.startedAt = start.toISOString()
  sub.expiresAt = end.toISOString()
  sub.durationMonths = duration
  sub.history.unshift({
    id: `h-${Date.now()}`,
    label: `Template ativado até ${end.toISOString().slice(0, 10)}`,
    at: start.toISOString().slice(0, 10),
  })
  saveTemplateSubscriptions(list)
  pushTemplateHistory(sub.realtorId, `Ativado ${template?.name || sub.templateId}`)
  trackTemplateEvent('template_activated', { templateId: sub.templateId, realtorId: sub.realtorId })
  notifyRealtor(sub.realtorId, 'Template profissional ativado', `Validade: ${duration} meses.`)
  return sub
}

export function renewTemplateSubscription(subscriptionId: string): BrokerTemplateSubscription {
  const list = loadTemplateSubscriptions()
  const sub = list.find((s) => s.id === subscriptionId)
  if (!sub) throw new Error('Assinatura não encontrada')
  const template = getTemplateById(sub.templateId)
  const duration = getTemplateDuration(template)
  const price = getTemplatePrice(template)
  const base = sub.expiresAt && new Date(sub.expiresAt) > new Date() ? new Date(sub.expiresAt) : new Date()
  const end = new Date(base)
  end.setMonth(end.getMonth() + duration)
  sub.price = price
  sub.status = 'active'
  sub.expiresAt = end.toISOString()
  sub.history.unshift({
    id: `h-${Date.now()}`,
    label: `Renovado por +${duration} meses (R$ ${price})`,
    at: new Date().toISOString().slice(0, 10),
  })
  saveTemplateSubscriptions(list)
  trackTemplateEvent('template_renewed', { templateId: sub.templateId, realtorId: sub.realtorId })
  notifyRealtor(sub.realtorId, 'Template renovado', `Novo vencimento: ${end.toISOString().slice(0, 10)}`)
  return sub
}

export function switchTemplate(subscriptionId: string, newTemplateId: string): BrokerTemplateSubscription {
  const template = getTemplateById(newTemplateId)
  if (!template || template.status !== 'active') throw new Error('Novo template indisponível')
  const list = loadTemplateSubscriptions()
  const sub = list.find((s) => s.id === subscriptionId)
  if (!sub) throw new Error('Assinatura não encontrada')
  const oldId = sub.templateId
  sub.templateId = template.id
  sub.templateVersion = template.version
  sub.history.unshift({
    id: `h-${Date.now()}`,
    label: `Troca de template ${oldId} → ${template.id} (dados preservados)`,
    at: new Date().toISOString().slice(0, 10),
  })
  saveTemplateSubscriptions(list)
  pushTemplateHistory(sub.realtorId, `Troca para ${template.name}`)
  trackTemplateEvent('template_changed', { templateId: newTemplateId, realtorId: sub.realtorId })
  return sub
}

export function revertToBasicSite(realtorId?: number) {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const list = loadTemplateSubscriptions()
  list.forEach((s) => {
    if (s.realtorId === id && (s.status === 'active' || s.status === 'expiring')) {
      s.status = 'cancelled'
      s.history.unshift({
        id: `h-${Date.now()}`,
        label: 'Retorno ao Meu Site básico (personalizações preservadas)',
        at: new Date().toISOString().slice(0, 10),
      })
    }
  })
  saveTemplateSubscriptions(list)
  pushTemplateHistory(id, 'Voltou ao Meu Site básico')
}

export function getCustomization(realtorId?: number | null): BrokerTemplateCustomization {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const map = loadJSON<Record<string, BrokerTemplateCustomization>>(CUSTOM_KEY, {})
  if (map[String(id)]) return map[String(id)]
  const settings = getMeuSiteSettings(id)
  return {
    realtorId: id,
    draft: {
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroText,
      bio: settings.bio,
      photo: settings.photo,
      cover: settings.coverImage,
      whatsapp: settings.whatsapp,
      creci: settings.creci,
      primaryColor: '#0f766e',
    },
    published: {},
    updatedAt: new Date().toISOString(),
  }
}

export function saveCustomization(custom: BrokerTemplateCustomization) {
  const map = loadJSON<Record<string, BrokerTemplateCustomization>>(CUSTOM_KEY, {})
  custom.updatedAt = new Date().toISOString()
  map[String(custom.realtorId)] = custom
  saveJSON(CUSTOM_KEY, map)
}

export function publishCustomization(realtorId?: number) {
  const custom = getCustomization(realtorId)
  custom.published = { ...custom.draft }
  custom.publishedAt = new Date().toISOString()
  saveCustomization(custom)
  return custom
}

function pushTemplateHistory(realtorId: number, label: string) {
  const map = loadJSON<Record<string, { id: string; label: string; at: string }[]>>(HISTORY_KEY, {})
  const arr = map[String(realtorId)] || []
  arr.unshift({ id: `th-${Date.now()}`, label, at: new Date().toISOString() })
  map[String(realtorId)] = arr.slice(0, 40)
  saveJSON(HISTORY_KEY, map)
}

export function getTemplateHistory(realtorId?: number | null) {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const map = loadJSON<Record<string, { id: string; label: string; at: string }[]>>(HISTORY_KEY, {})
  return map[String(id)] || []
}

export function trackTemplateEvent(
  event: string,
  payload: Record<string, string | number | undefined>
) {
  const list = loadJSON<{ event: string; at: string; payload: Record<string, unknown> }[]>(METRICS_KEY, [])
  list.unshift({ event, at: new Date().toISOString(), payload })
  saveJSON(METRICS_KEY, list.slice(0, 200))
}

function notifyRealtor(realtorId: number, title: string, message: string) {
  try {
    const key = 'imovelhub_notifications'
    const raw = localStorage.getItem(key)
    const list = raw ? JSON.parse(raw) : []
    list.unshift({
      id: `n-tpl-${Date.now()}`,
      realtorId,
      type: 'pagina_profissional',
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
      href: '/meu-site/templates',
    })
    localStorage.setItem(key, JSON.stringify(list.slice(0, 100)))
  } catch {
    /* ignore */
  }
}

const DOMAIN_RATE_KEY = 'imovelhub_domain_search_rate_v1'
const DOMAIN_SEARCH_WINDOW_MS = 60_000
const DOMAIN_SEARCH_MAX = 12

/** Rate limit simples de pesquisa de domínio (por sessão no navegador). */
export function assertDomainSearchAllowed(): void {
  if (typeof window === 'undefined') return
  const now = Date.now()
  const state = loadJSON<{ windowStart: number; count: number }>(DOMAIN_RATE_KEY, {
    windowStart: now,
    count: 0,
  })
  if (now - state.windowStart > DOMAIN_SEARCH_WINDOW_MS) {
    saveJSON(DOMAIN_RATE_KEY, { windowStart: now, count: 1 })
    return
  }
  if (state.count >= DOMAIN_SEARCH_MAX) {
    throw new Error('Muitas pesquisas de domínio. Aguarde cerca de 1 minuto e tente novamente.')
  }
  saveJSON(DOMAIN_RATE_KEY, { windowStart: state.windowStart, count: state.count + 1 })
}

/**
 * Garante que o corretor autenticado só acessa o próprio recurso.
 * Não confiar em realtorId enviado pelo frontend sem cruzar com a sessão.
 */
export function assertBrokerOwnership(resourceRealtorId: number, sessionRealtorId?: number | null): void {
  const sessionId = sessionRealtorId ?? getCurrentRealtorId()
  // Protótipo: sem sessão (SSR/demo) não bloqueia; com sessão, isola por corretor
  if (sessionId == null) return
  if (resourceRealtorId !== sessionId) {
    throw new Error('Acesso negado: recurso pertence a outro corretor')
  }
}

export function getOwnedCustomization(realtorId?: number | null): BrokerTemplateCustomization {
  const sessionId = getCurrentRealtorId()
  const id = realtorId ?? sessionId ?? 1
  assertBrokerOwnership(id, sessionId ?? id)
  return getCustomization(id)
}

export function getOwnedDomain(realtorId?: number | null): DomainConnection | null {
  const sessionId = getCurrentRealtorId()
  const id = realtorId ?? sessionId ?? 1
  assertBrokerOwnership(id, sessionId ?? id)
  return getBrokerDomain(id)
}

/** Domínios — provider manual (sem registro automático falso). */
export function searchDomains(query: string): DomainSearchResult[] {
  assertDomainSearchAllowed()
  const cleaned = query
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .trim()
  const base = cleaned.includes('.') ? cleaned.split('.')[0] : cleaned.replace(/[^a-z0-9-]/g, '')
  const cfg = getMarketplaceConfig()
  const extensions = [
    { ext: 'com.br', reg: 80, renew: 80 },
    { ext: 'com', reg: 55, renew: 55 },
    { ext: 'net', reg: 60, renew: 60 },
    { ext: 'imoveis', reg: 120, renew: 120 },
  ]
  trackTemplateEvent('domain_search', { domain: cleaned })
  const results = extensions.map(({ ext, reg, renew }) => {
    const domain = `${base}.${ext}`
    const taken = ['google.com', 'facebook.com', 'imovelhub.com.br'].includes(domain)
    return {
      domain,
      extension: ext,
      available: !taken && base.length >= 3,
      registrationPrice: reg,
      renewalPrice: renew,
      serviceFee: cfg.domainServiceFeeFrom,
    }
  })
  saveJSON(DOMAIN_SEARCH_KEY, { query: cleaned, at: new Date().toISOString(), results })
  return results
}

export function createDomainOrder(
  realtorId: number,
  result: DomainSearchResult
): DomainOrder {
  assertBrokerOwnership(realtorId)
  if (!result.available) throw new Error('Domínio indisponível')
  const existing = loadDomainOrders().find(
    (o) => o.domain === result.domain && o.status !== 'cancelled' && o.status !== 'failed'
  )
  if (existing) throw new Error('Já existe pedido para este domínio')

  const order: DomainOrder = {
    id: `do-${Date.now()}`,
    realtorId,
    domain: result.domain,
    extension: result.extension,
    provider: 'manual',
    status: 'manual_processing',
    registrationPrice: result.registrationPrice,
    serviceFee: getMarketplaceConfig().domainServiceFeeFrom,
    renewalPrice: result.renewalPrice,
    currency: 'BRL',
    registrationPeriodYears: 1,
    orderedAt: new Date().toISOString(),
    notes: 'Pedido manual — aguardando ação do Super Admin / provedor.',
  }
  const list = loadDomainOrders()
  list.unshift(order)
  saveJSON(DOMAIN_ORDERS_KEY, list)
  trackTemplateEvent('domain_order_started', { domain: result.domain, realtorId })
  notifyRealtor(realtorId, 'Pedido de domínio registrado', `${result.domain} em processamento manual.`)
  return order
}

export function loadDomainOrders(): DomainOrder[] {
  return loadJSON(DOMAIN_ORDERS_KEY, [] as DomainOrder[])
}

export function startExistingDomainConnection(realtorId: number, domain: string): DomainConnection {
  assertBrokerOwnership(realtorId)
  const normalized = domain
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim()
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(normalized)) {
    throw new Error('Formato de domínio inválido')
  }
  const all = loadDomainConnections()
  if (all.some((d) => d.domain === normalized && d.status !== 'disconnected')) {
    throw new Error('Este domínio já está em uso na plataforma')
  }
  const token = `ih-verify-${Math.random().toString(36).slice(2, 10)}`
  const conn: DomainConnection = {
    id: `dc-${Date.now()}`,
    realtorId,
    domain: normalized,
    connectionType: 'existing',
    provider: 'manual',
    status: 'awaiting_dns',
    verificationToken: token,
    sslStatus: 'none',
    dnsHints: [
      { type: 'CNAME', host: 'www', value: 'sites.imovelhub.local' },
      { type: 'A', host: '@', value: '203.0.113.10' },
      { type: 'TXT', host: '@', value: token },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  all.unshift(conn)
  saveJSON(DOMAIN_CONN_KEY, all)
  return conn
}

export function loadDomainConnections(): DomainConnection[] {
  return loadJSON(DOMAIN_CONN_KEY, [] as DomainConnection[])
}

export function getBrokerDomain(realtorId?: number | null): DomainConnection | null {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  return (
    loadDomainConnections()
      .filter((d) => d.realtorId === id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] || null
  )
}

export function markDomainValidated(connectionId: string): DomainConnection {
  const list = loadDomainConnections()
  const conn = list.find((d) => d.id === connectionId)
  if (!conn) throw new Error('Conexão não encontrada')
  conn.status = 'active'
  conn.sslStatus = 'active'
  conn.verifiedAt = new Date().toISOString()
  conn.activatedAt = new Date().toISOString()
  conn.updatedAt = new Date().toISOString()
  saveJSON(DOMAIN_CONN_KEY, list)
  notifyRealtor(conn.realtorId, 'Domínio conectado', `${conn.domain} ativo (simulado).`)
  return conn
}

export const badgeLabels: Record<TemplateBadge, string> = {
  novo: 'Novo',
  mais_escolhido: 'Mais escolhido',
  recomendado: 'Recomendado',
  alto_padrao: 'Alto padrão',
  exclusivo: 'Exclusivo',
  melhor_conversao: 'Melhor conversão',
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
