import { filterByRealtor, formatCurrency, getCurrentRealtorId } from '@/lib/phase7-data'
import { PROFESSIONAL_PAGE_PRICE } from '@/lib/phase12-data'
import { AI_INTEGRATION_PRICE, AI_PRICE_PROVISIONAL } from '@/lib/phase13-data'
import { normalizePlanId, type PlanId } from '@/lib/plan-access'

export type { PlanId }
export { normalizePlanId }

/** Preços mensais dos planos — PROVISÓRIOS e fáceis de editar. */
export const PLAN_PRICES_PROVISIONAL = true

export const TRIAL_DAYS = 7
export const DOWNGRADE_GRACE_DAYS = 7

export type LimitValue = number | 'ilimitado' | 'fair_use'
export type BillingCycle = 'mensal' | 'anual'

export interface PlanFeatureFlags {
  crm: 'basico' | 'completo'
  clientArea: 'basica' | 'completa'
  publicPage: boolean
  brokerSite: boolean
  finance: boolean
  negotiations: boolean
  proposals: boolean
  documents: boolean
  campaigns: boolean
  team: boolean
  rolesPermissions: boolean
  ai: 'bloqueado' | 'addon' | 'incluido'
  customDomain: 'bloqueado' | 'addon' | 'incluido'
  reports: 'basico' | 'avancado'
  integrations: boolean
  api: boolean
  webhooks: boolean
  support: 'email' | 'prioritario' | 'dedicado'
  siteMetrics: boolean
}

export interface SaaSPlan {
  id: PlanId
  name: string
  tagline: string
  /** Preço mensal provisório em R$ — editar aqui. */
  monthlyPrice: number
  /** Preço anual provisório em R$ — editar aqui. */
  yearlyPrice: number
  provisional: boolean
  popular?: boolean
  recommended?: boolean
  propertyLimit: number | 'ilimitado'
  userLimit: number | 'ilimitado'
  campaignLimit: LimitValue
  archivedProperties: boolean
  features: PlanFeatureFlags
  highlights: string[]
  excludes: string[]
  sortOrder: number
  active: boolean
}

export type PaymentStatus = 'aprovado' | 'pendente' | 'vencido' | 'falhou' | 'reembolsado'
export type SubscriptionStatus =
  | 'trial'
  | 'ativa'
  | 'pendente'
  | 'inadimplente'
  | 'cancelada'
  | 'suspensa'
  | 'limitado'
  | 'adequacao'

export interface Coupon {
  id: string
  code: string
  discountPercent: number
  active: boolean
  description: string
}

export interface AddOnProduct {
  id: string
  name: string
  description: string
  price: number
  billing: 'unico' | 'mensal' | 'pacote'
  provisional?: boolean
  href?: string
  /** Planos em que o add-on se aplica (opcional). */
  forPlans?: PlanId[]
}

export interface SubscriptionAddon {
  id: string
  productId: string
  name: string
  price: number
  billing: 'unico' | 'mensal' | 'pacote'
  active: boolean
}

export interface Invoice {
  id: string
  realtorId: number
  subscriptionId: string
  description: string
  amount: number
  status: PaymentStatus
  dueDate: string
  paidAt?: string
}

export interface Subscription {
  id: string
  realtorId: number
  realtorName: string
  planId: PlanId
  status: SubscriptionStatus
  paymentStatus: PaymentStatus
  billingCycle: BillingCycle
  startedAt: string
  renewsAt: string
  trialEndsAt?: string
  canceledAt?: string
  graceUntil?: string
  pendingPlanId?: PlanId
  couponCode?: string
  propertiesUsed: number
  usersUsed: number
  campaignsUsed: number
  addons: SubscriptionAddon[]
  history: { id: string; label: string; at: string }[]
}

export const saasPlans: SaaSPlan[] = [
  {
    id: 'essencial',
    name: 'Plano Essencial',
    tagline: 'Para começar com organização e presença básica.',
    monthlyPrice: 69.9,
    yearlyPrice: 699,
    provisional: true,
    propertyLimit: 30,
    userLimit: 1,
    campaignLimit: 1,
    archivedProperties: true,
    sortOrder: 1,
    features: {
      crm: 'basico',
      clientArea: 'basica',
      publicPage: true,
      brokerSite: true,
      finance: false,
      negotiations: false,
      proposals: false,
      documents: false,
      campaigns: true,
      team: false,
      rolesPermissions: false,
      ai: 'bloqueado',
      customDomain: 'bloqueado',
      reports: 'basico',
      integrations: false,
      api: false,
      webhooks: false,
      support: 'email',
      siteMetrics: false,
    },
    highlights: [
      'Até 30 imóveis ativos',
      '1 usuário',
      '1 campanha ativa',
      'Meu Site + CRM básico',
      'Área básica do cliente',
    ],
    excludes: [
      'Financeiro completo',
      'Negociações e propostas',
      'IA + WhatsApp',
      'Gestão de equipe',
      'Domínio personalizado',
    ],
    active: true,
  },
  {
    id: 'profissional',
    name: 'Plano Profissional',
    tagline: 'Para quem precisa escalar atendimento e conversão.',
    monthlyPrice: 149.9,
    yearlyPrice: 1499,
    provisional: true,
    popular: true,
    recommended: true,
    propertyLimit: 150,
    userLimit: 3,
    campaignLimit: 10,
    archivedProperties: true,
    sortOrder: 2,
    features: {
      crm: 'completo',
      clientArea: 'completa',
      publicPage: true,
      brokerSite: true,
      finance: true,
      negotiations: true,
      proposals: true,
      documents: true,
      campaigns: true,
      team: false,
      rolesPermissions: false,
      ai: 'addon',
      customDomain: 'addon',
      reports: 'basico',
      integrations: true,
      api: false,
      webhooks: false,
      support: 'prioritario',
      siteMetrics: true,
    },
    highlights: [
      'Até 150 imóveis ativos',
      'Até 3 usuários',
      'Até 10 campanhas',
      'Financeiro, propostas e negociações',
      'IA e domínio como add-on',
    ],
    excludes: ['Gestão avançada de equipe', 'API e webhooks', 'Relatórios avançados', 'Suporte dedicado'],
    active: true,
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    tagline: 'Para equipes e operação de alto volume.',
    monthlyPrice: 299.9,
    yearlyPrice: 2999,
    provisional: true,
    propertyLimit: 500,
    userLimit: 10,
    campaignLimit: 'fair_use',
    archivedProperties: true,
    sortOrder: 3,
    features: {
      crm: 'completo',
      clientArea: 'completa',
      publicPage: true,
      brokerSite: true,
      finance: true,
      negotiations: true,
      proposals: true,
      documents: true,
      campaigns: true,
      team: true,
      rolesPermissions: true,
      ai: 'incluido',
      customDomain: 'incluido',
      reports: 'avancado',
      integrations: true,
      api: true,
      webhooks: true,
      support: 'dedicado',
      siteMetrics: true,
    },
    highlights: [
      'Até 500 imóveis ativos',
      'Até 10 usuários',
      'Campanhas em uso justo',
      'Equipe, cargos e auditoria',
      'IA e domínio incluídos',
    ],
    excludes: [],
    active: true,
  },
]

export const addOnProducts: AddOnProduct[] = [
  {
    id: 'pagina-profissional',
    name: 'Página Profissional',
    description: 'Produção premium da vitrine do corretor.',
    price: PROFESSIONAL_PAGE_PRICE,
    billing: 'unico',
    href: '/professional',
  },
  {
    id: 'template-profissional',
    name: 'Template Profissional',
    description: 'Layout profissional da galeria (2 meses). Preço configurável.',
    price: 97,
    billing: 'unico',
    provisional: true,
    href: '/meu-site/templates',
  },
  {
    id: 'dominio-proprio',
    name: 'Domínio próprio',
    description: 'Configuração a partir de R$ 69,90/ano + registro (provisório).',
    price: 69.9,
    billing: 'unico',
    provisional: true,
    href: '/meu-site/dominio',
  },
  {
    id: 'ia-integracao',
    name: 'Integração da IA + WhatsApp',
    description: 'Ativação do agente isolado (valor provisório).',
    price: AI_INTEGRATION_PRICE,
    billing: 'unico',
    provisional: AI_PRICE_PROVISIONAL,
    href: '/ai',
    forPlans: ['profissional', 'premium'],
  },
  {
    id: 'ia-mensalidade-pro',
    name: 'Mensalidade da IA (Profissional)',
    description: 'Manutenção e consumo do agente no plano Profissional.',
    price: 97,
    billing: 'mensal',
    provisional: true,
    forPlans: ['profissional'],
  },
  {
    id: 'ia-mensalidade-premium',
    name: 'Mensalidade da IA (Premium)',
    description: 'Manutenção e consumo do agente no plano Premium (ativação inclusa).',
    price: 79,
    billing: 'mensal',
    provisional: true,
    forPlans: ['premium'],
  },
  {
    id: 'usuario-extra',
    name: 'Usuário adicional',
    description: 'Assento extra na equipe do corretor.',
    price: 29.9,
    billing: 'mensal',
    provisional: true,
  },
  {
    id: 'dominio',
    name: 'Domínio (legado mensal)',
    description: 'Add-on mensal legado no plano Profissional — preferir Domínio próprio.',
    price: 19.9,
    billing: 'mensal',
    provisional: true,
    forPlans: ['profissional'],
  },
  {
    id: 'pacote-mensagens',
    name: 'Pacote de mensagens',
    description: 'Créditos extras para o agente de IA.',
    price: 49,
    billing: 'pacote',
    provisional: true,
  },
  {
    id: 'identidade-visual',
    name: 'Identidade visual',
    description: 'Pacote de marca para página e materiais.',
    price: 790,
    billing: 'unico',
    provisional: true,
  },
  {
    id: 'tour-360',
    name: 'Tour 360°',
    description: 'Produção e publicação de tour virtual (simulado).',
    price: 350,
    billing: 'unico',
    provisional: true,
  },
  {
    id: 'videos',
    name: 'Produção de vídeos',
    description: 'Pacote de vídeos para imóveis e redes.',
    price: 690,
    billing: 'unico',
    provisional: true,
  },
  {
    id: 'campanhas',
    name: 'Gestão de campanhas',
    description: 'Landing e acompanhamento de campanhas do corretor.',
    price: 297,
    billing: 'mensal',
    provisional: true,
  },
  {
    id: 'personalizado',
    name: 'Serviços personalizados',
    description: 'Escopo sob medida com a equipe ImóvelHub.',
    price: 0,
    billing: 'unico',
    provisional: true,
  },
]

export const coupons: Coupon[] = []

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  aprovado: 'Aprovado',
  pendente: 'Pendente',
  vencido: 'Vencido',
  falhou: 'Falhou',
  reembolsado: 'Reembolsado',
}

export const paymentStatusBadge: Record<
  PaymentStatus,
  'success' | 'warning' | 'destructive' | 'info' | 'default'
> = {
  aprovado: 'success',
  pendente: 'warning',
  vencido: 'destructive',
  falhou: 'destructive',
  reembolsado: 'info',
}

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  trial: 'Teste gratuito',
  ativa: 'Ativa',
  pendente: 'Pendente',
  inadimplente: 'Inadimplente',
  cancelada: 'Cancelada',
  suspensa: 'Suspensa',
  limitado: 'Limitado',
  adequacao: 'Em adequação',
}

function daysFromToday(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export let subscriptions: Subscription[] = []

export let invoices: Invoice[] = []

const STORAGE_PLANS = 'phase14Plans_v2'
const STORAGE_SUBS = 'phase14Subscriptions_v2'
const STORAGE_INV = 'phase14Invoices_v2'
const STORAGE_COUPONS = 'phase14Coupons_v2'

function migratePlanId(id: string): PlanId {
  return normalizePlanId(id)
}

function migrateSubscription(raw: Subscription & { planId: string }): Subscription {
  return {
    ...raw,
    planId: migratePlanId(raw.planId),
    pendingPlanId: raw.pendingPlanId ? migratePlanId(raw.pendingPlanId) : undefined,
    billingCycle: raw.billingCycle || 'mensal',
    campaignsUsed: raw.campaignsUsed ?? 0,
    addons: raw.addons || [],
  }
}

function migratePlan(raw: SaaSPlan & { id: string }): SaaSPlan {
  const id = migratePlanId(raw.id)
  const seed = saasPlans.find((p) => p.id === id)
  if (!seed) return { ...raw, id } as SaaSPlan
  return {
    ...seed,
    ...raw,
    id,
    yearlyPrice: raw.yearlyPrice ?? seed.yearlyPrice,
    campaignLimit: raw.campaignLimit ?? seed.campaignLimit,
    archivedProperties: raw.archivedProperties ?? seed.archivedProperties,
    recommended: raw.recommended ?? seed.recommended,
    excludes: raw.excludes ?? seed.excludes,
    sortOrder: raw.sortOrder ?? seed.sortOrder,
    features: { ...seed.features, ...(raw.features || {}) },
  }
}

export function loadPlans(): SaaSPlan[] {
  if (typeof window === 'undefined') return saasPlans
  try {
    const raw = localStorage.getItem(STORAGE_PLANS)
    if (!raw) return saasPlans
    const parsed = JSON.parse(raw) as SaaSPlan[]
    return parsed.map(migratePlan).sort((a, b) => a.sortOrder - b.sortOrder)
  } catch {
    return saasPlans
  }
}

export function savePlans(plans: SaaSPlan[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_PLANS, JSON.stringify(plans))
}

export function loadSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') return subscriptions
  try {
    const raw = localStorage.getItem(STORAGE_SUBS)
    if (!raw) return subscriptions
    subscriptions = (JSON.parse(raw) as Subscription[]).map(migrateSubscription)
    return subscriptions
  } catch {
    return subscriptions
  }
}

export function saveSubscriptions(list: Subscription[]) {
  subscriptions = list.map(migrateSubscription)
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_SUBS, JSON.stringify(subscriptions))
}

export function loadInvoices(): Invoice[] {
  if (typeof window === 'undefined') return invoices
  try {
    const raw = localStorage.getItem(STORAGE_INV)
    if (!raw) return invoices
    invoices = JSON.parse(raw) as Invoice[]
    return invoices
  } catch {
    return invoices
  }
}

export function saveInvoices(list: Invoice[]) {
  invoices = list
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_INV, JSON.stringify(list))
}

export function loadCoupons(): Coupon[] {
  if (typeof window === 'undefined') return coupons
  try {
    const raw = localStorage.getItem(STORAGE_COUPONS)
    if (!raw) return coupons
    return JSON.parse(raw) as Coupon[]
  } catch {
    return coupons
  }
}

export function saveCoupons(list: Coupon[]) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_COUPONS, JSON.stringify(list))
}

export function getPlan(id: PlanId | string, plans = loadPlans()): SaaSPlan | undefined {
  const normalized = migratePlanId(id)
  return plans.find((p) => p.id === normalized)
}

export function getRealtorSubscription(realtorId?: number | null): Subscription | null {
  const id = realtorId ?? getCurrentRealtorId()
  if (id === null) return null
  const items = loadSubscriptions().filter((s) => s.realtorId === id)
  if (!items.length) return null
  return items.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
}

export function getScopedSubscriptions(): Subscription[] {
  return filterByRealtor(loadSubscriptions())
}

export function getRealtorInvoices(realtorId?: number | null): Invoice[] {
  const id = realtorId ?? getCurrentRealtorId()
  if (id === null) return loadInvoices()
  return loadInvoices().filter((i) => i.realtorId === id)
}

export function upsertSubscription(sub: Subscription) {
  const next = migrateSubscription(sub)
  const list = loadSubscriptions()
  const idx = list.findIndex((s) => s.id === next.id)
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  saveSubscriptions(list)
  return next
}

export function applyCoupon(code: string, amount: number): { ok: boolean; amount: number; message: string } {
  const coupon = loadCoupons().find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active)
  if (!coupon) return { ok: false, amount, message: 'Cupom inválido ou inativo.' }
  const next = Math.round(amount * (1 - coupon.discountPercent / 100) * 100) / 100
  return { ok: true, amount: next, message: `${coupon.discountPercent}% aplicado.` }
}

export function limitLabel(value: LimitValue): string {
  if (value === 'ilimitado') return 'Ilimitado'
  if (value === 'fair_use') return 'Uso justo'
  return String(value)
}

export function usagePercent(used: number, limit: LimitValue): number {
  if (limit === 'ilimitado' || limit === 'fair_use') {
    return Math.min(Math.round((used / Math.max(used, 1)) * 10), 15)
  }
  return Math.min(Math.round((used / Math.max(limit, 1)) * 100), 100)
}

export function featureLabel(
  key: keyof PlanFeatureFlags,
  value: PlanFeatureFlags[keyof PlanFeatureFlags]
): string {
  if (key === 'support') {
    const map = { email: 'E-mail', prioritario: 'Prioritário', dedicado: 'Dedicado' }
    return map[value as PlanFeatureFlags['support']]
  }
  if (typeof value === 'boolean') return value ? 'Incluído' : 'Não incluso'
  const labels: Record<string, string> = {
    basico: 'Básico',
    basica: 'Básica',
    completo: 'Completo',
    completa: 'Completa',
    avancado: 'Avançado',
    bloqueado: 'Não incluso',
    addon: 'Add-on',
    incluido: 'Incluído',
  }
  return labels[String(value)] || String(value)
}

/**
 * Garante assinatura Premium ativa no browser (acesso completo ao painel).
 * Enquanto o billing real não existir, libera o menu/rotas sem locks.
 */
export function ensureFullPlanAccess(realtorId?: number | null): Subscription | null {
  if (typeof window === 'undefined') return null
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const existing = getRealtorSubscription(id)
  const now = new Date()
  const renews = new Date(now)
  renews.setFullYear(renews.getFullYear() + 1)

  if (existing?.planId === 'premium' && existing.status === 'ativa') {
    return existing
  }

  return upsertSubscription({
    id: existing?.id || `sub-full-${id}`,
    realtorId: id,
    realtorName: existing?.realtorName || 'Corretor',
    planId: 'premium',
    status: 'ativa',
    paymentStatus: 'aprovado',
    billingCycle: existing?.billingCycle || 'anual',
    startedAt: existing?.startedAt || now.toISOString(),
    renewsAt: renews.toISOString(),
    propertiesUsed: existing?.propertiesUsed ?? 0,
    usersUsed: existing?.usersUsed ?? 1,
    campaignsUsed: existing?.campaignsUsed ?? 0,
    addons: existing?.addons || [],
    history: [
      ...(existing?.history || []),
      { id: `h-full-${Date.now()}`, label: 'Acesso Premium liberado', at: now.toISOString() },
    ],
  })
}

/** Plano efetivo para checagem de recursos (trial → profissional; limitado → essencial). */
export function getEffectivePlanId(sub?: Subscription | null): PlanId {
  const subscription = sub ?? getRealtorSubscription()
  if (!subscription) return 'premium'
  if (subscription.status === 'trial') return 'profissional'
  if (subscription.status === 'limitado') return 'essencial'
  if (subscription.status === 'adequacao' && subscription.pendingPlanId) {
    // Durante adequação, mantém acesso do plano atual até o grace terminar
    return migratePlanId(subscription.planId)
  }
  return migratePlanId(subscription.planId)
}

export function getTrialDaysRemaining(sub?: Subscription | null): number {
  const subscription = sub ?? getRealtorSubscription()
  if (!subscription?.trialEndsAt || subscription.status !== 'trial') return 0
  const end = new Date(subscription.trialEndsAt)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function canCreateActiveProperty(realtorId?: number | null): {
  ok: boolean
  message: string
  used: number
  limit: number | 'ilimitado'
} {
  const sub = getRealtorSubscription(realtorId)
  const planId = getEffectivePlanId(sub)
  const plan = getPlan(planId)
  const used = sub?.propertiesUsed ?? 0
  const limit = plan?.propertyLimit ?? 30

  if (limit === 'ilimitado') {
    return { ok: true, message: 'Limite ilimitado.', used, limit }
  }
  if (used >= limit) {
    return {
      ok: false,
      message: `Limite de ${limit} imóveis ativos atingido no plano atual. Faça upgrade ou arquive imóveis.`,
      used,
      limit,
    }
  }
  return { ok: true, message: 'Dentro do limite.', used, limit }
}

export function getYearlySavings(plan: SaaSPlan): number {
  const monthlyTotal = plan.monthlyPrice * 12
  return Math.max(0, Math.round((monthlyTotal - plan.yearlyPrice) * 100) / 100)
}

export function getEquivalentMonthly(plan: SaaSPlan): number {
  return Math.round((plan.yearlyPrice / 12) * 100) / 100
}

export function simulateUpgrade(targetPlanId: PlanId, realtorId?: number | null): Subscription | null {
  const sub = getRealtorSubscription(realtorId)
  if (!sub) return null
  const target = migratePlanId(targetPlanId)
  const updated = upsertSubscription({
    ...sub,
    planId: target,
    pendingPlanId: undefined,
    graceUntil: undefined,
    status: sub.status === 'trial' || sub.status === 'limitado' ? 'ativa' : sub.status === 'cancelada' ? 'ativa' : sub.status,
    paymentStatus: 'aprovado',
    history: [
      {
        id: `h-${Date.now()}`,
        label: `Upgrade simulado para ${getPlan(target)?.name || target}`,
        at: new Date().toLocaleString('pt-BR'),
      },
      ...sub.history,
    ],
  })
  return updated
}

export function simulateDowngrade(targetPlanId: PlanId, realtorId?: number | null): Subscription | null {
  const sub = getRealtorSubscription(realtorId)
  if (!sub) return null
  const target = migratePlanId(targetPlanId)
  const graceUntil = daysFromToday(DOWNGRADE_GRACE_DAYS)
  const updated = upsertSubscription({
    ...sub,
    pendingPlanId: target,
    graceUntil,
    status: 'adequacao',
    history: [
      {
        id: `h-${Date.now()}`,
        label: `Downgrade solicitado para ${getPlan(target)?.name || target} — adequação até ${graceUntil}`,
        at: new Date().toLocaleString('pt-BR'),
      },
      ...sub.history,
    ],
  })
  return updated
}

export function completeGraceDowngrade(realtorId?: number | null): Subscription | null {
  const sub = getRealtorSubscription(realtorId)
  if (!sub?.pendingPlanId) return sub
  const target = migratePlanId(sub.pendingPlanId)
  const updated = upsertSubscription({
    ...sub,
    planId: target,
    pendingPlanId: undefined,
    graceUntil: undefined,
    status: 'ativa',
    history: [
      {
        id: `h-${Date.now()}`,
        label: `Downgrade concluído — agora em ${getPlan(target)?.name || target}`,
        at: new Date().toLocaleString('pt-BR'),
      },
      ...sub.history,
    ],
  })
  return updated
}

export function startTrial(realtorId?: number | null, realtorName?: string): Subscription {
  const id = realtorId ?? getCurrentRealtorId() ?? 1
  const existing = getRealtorSubscription(id)
  const trialEndsAt = daysFromToday(TRIAL_DAYS)
  return upsertSubscription({
    id: existing?.id || `sub-${Date.now()}`,
    realtorId: id,
    realtorName: realtorName || existing?.realtorName || 'Corretor',
    planId: 'profissional',
    status: 'trial',
    paymentStatus: 'pendente',
    billingCycle: 'mensal',
    startedAt: existing?.startedAt || new Date().toISOString().slice(0, 10),
    renewsAt: trialEndsAt,
    trialEndsAt,
    propertiesUsed: existing?.propertiesUsed ?? 0,
    usersUsed: existing?.usersUsed ?? 1,
    campaignsUsed: existing?.campaignsUsed ?? 0,
    addons: existing?.addons || [],
    history: [
      {
        id: `h-${Date.now()}`,
        label: `Teste gratuito iniciado (${TRIAL_DAYS} dias) — Profissional`,
        at: new Date().toLocaleString('pt-BR'),
      },
      ...(existing?.history || []),
    ],
  })
}

export function endTrialToLimited(realtorId?: number | null): Subscription | null {
  const sub = getRealtorSubscription(realtorId)
  if (!sub || sub.status !== 'trial') return sub
  return upsertSubscription({
    ...sub,
    planId: 'essencial',
    status: 'limitado',
    trialEndsAt: undefined,
    history: [
      {
        id: `h-${Date.now()}`,
        label: 'Teste encerrado — acesso limitado ao Essencial',
        at: new Date().toLocaleString('pt-BR'),
      },
      ...sub.history,
    ],
  })
}

export { formatCurrency, getCurrentRealtorId, PROFESSIONAL_PAGE_PRICE, AI_INTEGRATION_PRICE }
