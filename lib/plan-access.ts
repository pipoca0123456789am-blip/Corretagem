/**
 * Matriz central de acesso por plano — preparada para migrar ao banco no futuro.
 * Fonte editável no protótipo; Super Admin pode sobrescrever via localStorage (phase14).
 */

export type PlanId = 'essencial' | 'profissional' | 'premium'

/** Alias legado → plano atual */
export function normalizePlanId(id: string | null | undefined): PlanId {
  if (id === 'inicial' || id === 'starter') return 'essencial'
  if (id === 'profissional' || id === 'premium' || id === 'essencial') return id
  return 'essencial'
}

export type FeatureId =
  | 'dashboard'
  | 'properties'
  | 'public_property_page'
  | 'broker_site'
  | 'clients'
  | 'leads'
  | 'crm_basic'
  | 'crm_advanced'
  | 'agenda'
  | 'visits'
  | 'proposals'
  | 'negotiations'
  | 'finance'
  | 'commissions'
  | 'client_area_basic'
  | 'client_area_full'
  | 'reports_basic'
  | 'reports_advanced'
  | 'campaigns'
  | 'team'
  | 'roles_permissions'
  | 'custom_domain'
  | 'integrations'
  | 'ai_whatsapp'
  | 'api'
  | 'webhooks'
  | 'pwa'
  | 'priority_support'
  | 'dedicated_support'
  | 'documents'
  | 'site_metrics'
  | 'export_reports'
  | 'team_audit'
  | 'management_dashboard'
  | 'goals'

export type LimitType = 'count' | 'boolean' | 'none'
export type FeatureCategory =
  | 'operacao'
  | 'crm'
  | 'financeiro'
  | 'presenca'
  | 'equipe'
  | 'relatorios'
  | 'integracoes'
  | 'suporte'

export interface FeatureDefinition {
  id: FeatureId
  name: string
  description: string
  benefits: string[]
  category: FeatureCategory
  /** Plano mínimo que libera o recurso (sem add-on) */
  minPlan: PlanId
  limitType: LimitType
  /** Chave de limite no plano, se aplicável */
  limitKey?: 'propertyLimit' | 'userLimit' | 'campaignLimit'
  addonEligible?: boolean
  routes: string[]
  menuHrefs?: string[]
  lockMessage: string
  upgradeCta: string
}

export const PLAN_ORDER: PlanId[] = ['essencial', 'profissional', 'premium']

export function planRank(planId: PlanId): number {
  return PLAN_ORDER.indexOf(normalizePlanId(planId))
}

export function planMeetsMinimum(current: PlanId, minimum: PlanId): boolean {
  return planRank(normalizePlanId(current)) >= planRank(minimum)
}

export const featureCatalog: FeatureDefinition[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel com visão geral da carteira e atividades.',
    benefits: ['Resumo do dia', 'Atalhos de operação'],
    category: 'operacao',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/dashboard'],
    menuHrefs: ['/dashboard'],
    lockMessage: 'Disponível em todos os planos.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'properties',
    name: 'Gestão de imóveis',
    description: 'Cadastro, publicação e arquivamento de imóveis.',
    benefits: ['Página individual automática', 'Arquivamento sem perda de dados'],
    category: 'operacao',
    minPlan: 'essencial',
    limitType: 'count',
    limitKey: 'propertyLimit',
    routes: ['/properties', '/imoveis'],
    menuHrefs: ['/imoveis'],
    lockMessage: 'Incluído a partir do Plano Essencial.',
    upgradeCta: 'Fazer upgrade',
  },
  {
    id: 'public_property_page',
    name: 'Página individual do imóvel',
    description: 'Vitrine pública automática de cada imóvel publicado.',
    benefits: ['Link para anúncios', 'Compartilhamento'],
    category: 'presenca',
    minPlan: 'essencial',
    limitType: 'none',
    routes: [],
    lockMessage: 'Incluído no Meu Site.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'broker_site',
    name: 'Meu Site',
    description: 'Vitrine automática do corretor incluída na assinatura.',
    benefits: ['Captação de leads', 'SEO básico', 'QR Code e links'],
    category: 'presenca',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/meu-site'],
    menuHrefs: ['/meu-site'],
    lockMessage: 'Incluído em todos os planos.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'clients',
    name: 'Clientes',
    description: 'Carteira de clientes vinculada ao corretor.',
    benefits: ['Isolamento de carteira', 'Histórico básico'],
    category: 'crm',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/clients', '/clientes'],
    menuHrefs: ['/clientes'],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'leads',
    name: 'Leads',
    description: 'Captação e organização de leads.',
    benefits: ['Origem do lead', 'Vinculação ao corretor'],
    category: 'crm',
    minPlan: 'essencial',
    limitType: 'none',
    routes: [],
    menuHrefs: ['/crm'],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'crm_basic',
    name: 'CRM básico',
    description: 'Funil simples e acompanhamento de leads.',
    benefits: ['Funil básico', 'Status de atendimento'],
    category: 'crm',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/crm', '/clients'],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'crm_advanced',
    name: 'CRM completo',
    description: 'Funil personalizado, origem de leads e automações comerciais básicas.',
    benefits: ['Funil personalizado', 'Origem dos leads', 'Automações básicas'],
    category: 'crm',
    minPlan: 'profissional',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Compromissos e organização do dia.',
    benefits: ['Visitas e reuniões'],
    category: 'operacao',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/agenda'],
    menuHrefs: ['/agenda'],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'visits',
    name: 'Visitas',
    description: 'Agendamento e acompanhamento de visitas.',
    benefits: ['Status de visita', 'Histórico'],
    category: 'operacao',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/visits', '/visitas'],
    menuHrefs: ['/visitas'],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'proposals',
    name: 'Propostas',
    description: 'Envio e gestão de propostas e contrapropostas.',
    benefits: ['Propostas', 'Contrapropostas'],
    category: 'crm',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/offers'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'negotiations',
    name: 'Negociações',
    description: 'Pipeline de negociação até o fechamento.',
    benefits: ['Checklist', 'Contratos', 'Assinaturas'],
    category: 'crm',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/negotiations', '/negociacoes'],
    menuHrefs: ['/negociacoes'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'finance',
    name: 'Financeiro completo',
    description: 'Controle receitas, despesas, comissões previstas e valores recebidos.',
    benefits: ['Receitas e despesas', 'Fluxo de caixa', 'Relatórios financeiros'],
    category: 'financeiro',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/financial', '/financeiro'],
    menuHrefs: ['/financeiro'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'commissions',
    name: 'Comissões',
    description: 'Previsão e acompanhamento de comissões.',
    benefits: ['Comissões previstas', 'Valores recebidos'],
    category: 'financeiro',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/financial/commissions'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'client_area_basic',
    name: 'Área básica do cliente',
    description: 'Portal do cliente com favoritos e qualificação.',
    benefits: ['Favoritos', 'Formulário de qualificação'],
    category: 'presenca',
    minPlan: 'essencial',
    limitType: 'none',
    routes: [],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'client_area_full',
    name: 'Área completa do cliente',
    description: 'Documentos, comparação, propostas e histórico completo.',
    benefits: ['Documentos', 'Comparação de imóveis', 'Propostas e histórico'],
    category: 'presenca',
    minPlan: 'profissional',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'reports_basic',
    name: 'Relatórios básicos',
    description: 'Indicadores essenciais da operação.',
    benefits: ['Visão resumida', 'Atividades recentes'],
    category: 'relatorios',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/reports'],
    menuHrefs: ['/reports'],
    lockMessage: 'Incluído no Essencial.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'reports_advanced',
    name: 'Relatórios avançados',
    description: 'Métricas gerenciais, metas e comparações de desempenho.',
    benefits: ['Exportação', 'Metas', 'Comparativos'],
    category: 'relatorios',
    minPlan: 'premium',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'export_reports',
    name: 'Exportação de relatórios',
    description: 'Exportar relatórios para análise externa.',
    benefits: ['Exportação'],
    category: 'relatorios',
    minPlan: 'profissional',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'campaigns',
    name: 'Campanhas',
    description: 'Campanhas de captação vinculadas ao corretor.',
    benefits: ['Landings', 'Origem de leads'],
    category: 'presenca',
    minPlan: 'profissional',
    limitType: 'count',
    limitKey: 'campaignLimit',
    routes: ['/campanhas', '/professional'],
    menuHrefs: ['/campanhas'],
    lockMessage: 'Campanhas avançadas a partir do Plano Profissional. Essencial: 1 campanha ativa.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'site_metrics',
    name: 'Métricas do Meu Site',
    description: 'Visualizações, leads e imóveis mais vistos.',
    benefits: ['Analytics do site', 'Leads captados'],
    category: 'relatorios',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/meu-site'],
    lockMessage: 'Métricas avançadas a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'documents',
    name: 'Documentos',
    description: 'Gestão de documentos da operação.',
    benefits: ['Central de documentos'],
    category: 'operacao',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/documents'],
    menuHrefs: ['/documents'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'team',
    name: 'Gestão de equipe',
    description: 'Usuários da equipe, distribuição de leads e acompanhamento.',
    benefits: ['Distribuição de leads', 'Acompanhamento da equipe'],
    category: 'equipe',
    minPlan: 'premium',
    limitType: 'count',
    limitKey: 'userLimit',
    routes: ['/team'],
    menuHrefs: ['/team'],
    lockMessage: 'Disponível a partir do Plano Premium. Profissional permite até 3 usuários sem gestão avançada.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'roles_permissions',
    name: 'Cargos e permissões',
    description: 'Controle fino de acesso por cargo na equipe.',
    benefits: ['Cargos', 'Permissões', 'Auditoria'],
    category: 'equipe',
    minPlan: 'premium',
    limitType: 'none',
    routes: ['/team'],
    lockMessage: 'Disponível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'team_audit',
    name: 'Auditoria da equipe',
    description: 'Registro das ações dos membros da equipe.',
    benefits: ['Rastreabilidade', 'Segurança'],
    category: 'equipe',
    minPlan: 'premium',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'management_dashboard',
    name: 'Dashboard de gestão',
    description: 'Visão gerencial para equipes e metas.',
    benefits: ['Desempenho', 'Comparativos'],
    category: 'relatorios',
    minPlan: 'premium',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'goals',
    name: 'Metas',
    description: 'Definição e acompanhamento de metas da equipe.',
    benefits: ['Metas', 'Acompanhamento'],
    category: 'relatorios',
    minPlan: 'premium',
    limitType: 'none',
    routes: [],
    lockMessage: 'Disponível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'custom_domain',
    name: 'Domínio personalizado',
    description: 'Use seu próprio domínio no Meu Site.',
    benefits: ['Branding', 'SEO'],
    category: 'presenca',
    minPlan: 'premium',
    limitType: 'boolean',
    addonEligible: true,
    routes: [],
    lockMessage: 'Incluído no Premium. No Profissional, disponível como add-on.',
    upgradeCta: 'Ver add-on ou upgrade para Premium',
  },
  {
    id: 'integrations',
    name: 'Integrações',
    description: 'Conexões com ferramentas externas.',
    benefits: ['Integrações básicas ou avançadas conforme o plano'],
    category: 'integracoes',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/integrations'],
    menuHrefs: ['/integrations'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'ai_whatsapp',
    name: 'IA + WhatsApp',
    description: 'Agente de atendimento isolado por corretor.',
    benefits: ['Atendimento 24h', 'Qualificação de leads'],
    category: 'integracoes',
    minPlan: 'profissional',
    limitType: 'boolean',
    addonEligible: true,
    routes: ['/ai', '/minha-ia'],
    menuHrefs: ['/minha-ia'],
    lockMessage: 'Não disponível no Essencial. No Profissional: add-on. No Premium: ativação incluída.',
    upgradeCta: 'Ver planos e add-ons de IA',
  },
  {
    id: 'api',
    name: 'API',
    description: 'Acesso programático elegível à API da plataforma.',
    benefits: ['Automações', 'Integrações customizadas'],
    category: 'integracoes',
    minPlan: 'premium',
    limitType: 'none',
    routes: [],
    lockMessage: 'Elegível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Eventos em tempo real para sistemas externos.',
    benefits: ['Notificações de eventos'],
    category: 'integracoes',
    minPlan: 'premium',
    limitType: 'none',
    routes: [],
    lockMessage: 'Elegível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
  {
    id: 'pwa',
    name: 'PWA do corretor',
    description: 'Aplicativo instalável exclusivo para corretores.',
    benefits: ['Acesso rápido', 'Modo standalone'],
    category: 'operacao',
    minPlan: 'essencial',
    limitType: 'none',
    routes: ['/settings/aplicativo'],
    lockMessage: 'Incluído em todos os planos.',
    upgradeCta: 'Ver planos',
  },
  {
    id: 'priority_support',
    name: 'Suporte prioritário',
    description: 'Atendimento com prioridade.',
    benefits: ['Fila prioritária'],
    category: 'suporte',
    minPlan: 'profissional',
    limitType: 'none',
    routes: ['/help', '/suporte'],
    lockMessage: 'Disponível a partir do Plano Profissional.',
    upgradeCta: 'Fazer upgrade para o Profissional',
  },
  {
    id: 'dedicated_support',
    name: 'Suporte dedicado',
    description: 'Onboarding assistido e prioridade em solicitações.',
    benefits: ['Onboarding assistido', 'Prioridade em solicitações'],
    category: 'suporte',
    minPlan: 'premium',
    limitType: 'none',
    routes: ['/help', '/suporte'],
    lockMessage: 'Disponível a partir do Plano Premium.',
    upgradeCta: 'Fazer upgrade para o Premium',
  },
]

export function getFeature(id: FeatureId): FeatureDefinition {
  const f = featureCatalog.find((x) => x.id === id)
  if (!f) throw new Error(`Feature não encontrada: ${id}`)
  return f
}

export function findFeatureByPath(pathname: string): FeatureDefinition | undefined {
  const path = pathname.split('?')[0]
  return featureCatalog.find((f) =>
    f.routes.some((r) => path === r || path.startsWith(`${r}/`))
  )
}

/** Recursos que o plano libera nativamente (sem add-on pago). */
export function isFeatureIncludedInPlan(planId: PlanId, featureId: FeatureId): boolean {
  const feature = getFeature(featureId)
  const plan = normalizePlanId(planId)

  // Campanhas: Essencial tem 1 campanha (recurso parcial) — liberar rota base
  if (featureId === 'campaigns' && plan === 'essencial') return true

  // Team: Profissional tem usuários extras, mas gestão avançada só Premium
  if (featureId === 'team' && plan === 'profissional') return false

  // Domínio: Premium incluso; Profissional só add-on
  if (featureId === 'custom_domain' && plan === 'profissional') return false

  // IA: Essencial bloqueado; Profissional add-on (não incluso); Premium ativação inclusa
  if (featureId === 'ai_whatsapp') {
    if (plan === 'essencial') return false
    if (plan === 'profissional') return false // precisa add-on
    return true // premium ativação incluída
  }

  // Relatórios: Essencial só básicos; avançados Premium
  if (featureId === 'reports_basic') return true
  if (featureId === 'reports_advanced') return plan === 'premium'

  // Documents / finance etc. usam minPlan
  return planMeetsMinimum(plan, feature.minPlan)
}

export function featureAccessLabel(planId: PlanId, featureId: FeatureId): 'incluido' | 'addon' | 'bloqueado' {
  const plan = normalizePlanId(planId)
  const feature = getFeature(featureId)

  if (isFeatureIncludedInPlan(plan, featureId)) return 'incluido'

  if (featureId === 'ai_whatsapp' && plan === 'profissional') return 'addon'
  if (featureId === 'custom_domain' && plan === 'profissional') return 'addon'

  if (feature.addonEligible && planMeetsMinimum(plan, feature.minPlan)) return 'addon'

  return 'bloqueado'
}

export const MENU_FEATURE_MAP: Record<string, FeatureId> = {
  '/dashboard': 'dashboard',
  '/imoveis': 'properties',
  '/clientes': 'clients',
  '/crm': 'crm_basic',
  '/clients': 'clients',
  '/agenda': 'agenda',
  '/visitas': 'visits',
  '/negociacoes': 'negotiations',
  '/financeiro': 'finance',
  '/reports': 'reports_basic',
  '/documents': 'documents',
  '/meu-site': 'broker_site',
  '/minha-pagina': 'broker_site', // página premium é add-on, mas link fica acessível
  '/minha-ia': 'ai_whatsapp',
  '/campanhas': 'campaigns',
  '/assinatura': 'dashboard',
  '/team': 'team',
  '/integrations': 'integrations',
  '/suporte': 'dashboard',
  '/configuracoes': 'dashboard',
  '/profile': 'dashboard',
  '/solicitacoes': 'dashboard',
  '/notificacoes': 'dashboard',
}
