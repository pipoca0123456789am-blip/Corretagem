import { filterByRealtor, formatCurrency, getCurrentRealtorId } from '@/lib/phase7-data'
import { getRealtorProperties, publicRealtorProfiles } from '@/lib/phase9-data'

/** Valor inicial sugerido — provisório nesta fase. */
export const AI_INTEGRATION_PRICE = 97
export const AI_PRICE_PROVISIONAL = true

export type AiIntegrationStatus =
  | 'nao_contratado'
  | 'aguardando_pagamento'
  | 'pagamento_confirmado'
  | 'aguardando_informacoes'
  | 'em_configuracao'
  | 'aguardando_conexao'
  | 'em_testes'
  | 'ativo'
  | 'pausado'
  | 'com_falha'
  | 'suspenso'
  | 'cancelado'

export const aiStatusLabels: Record<AiIntegrationStatus, string> = {
  nao_contratado: 'Não contratado',
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_confirmado: 'Pagamento confirmado',
  aguardando_informacoes: 'Aguardando informações',
  em_configuracao: 'Em configuração',
  aguardando_conexao: 'Aguardando conexão',
  em_testes: 'Em testes',
  ativo: 'Ativo',
  pausado: 'Pausado',
  com_falha: 'Com falha',
  suspenso: 'Suspenso',
  cancelado: 'Cancelado',
}

export const aiStatusBadge: Record<
  AiIntegrationStatus,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'
> = {
  nao_contratado: 'default',
  aguardando_pagamento: 'warning',
  pagamento_confirmado: 'success',
  aguardando_informacoes: 'warning',
  em_configuracao: 'info',
  aguardando_conexao: 'warning',
  em_testes: 'primary',
  ativo: 'success',
  pausado: 'secondary',
  com_falha: 'destructive',
  suspenso: 'destructive',
  cancelado: 'destructive',
}

export type ConversationStatus = 'ia' | 'humano' | 'aguardando' | 'encerrada'
export type MessageSender = 'cliente' | 'ia' | 'corretor' | 'sistema'

export interface AiAgentConfig {
  name: string
  avatar: string
  tone: string
  style: string
  businessHours: string
  welcomeMessage: string
  offlineMessage: string
  responseRules: string
  limits: string
  faqs: string[]
  knowledgeBase: string[]
  authorizedPropertyIds: string[]
  humanHandoffEnabled: boolean
  triggerWords: string[]
  followUpEnabled: boolean
  followUpHours: number
  remindersEnabled: boolean
  whatsappNumber: string
  whatsappLabel: string
}

export interface AiMessage {
  id: string
  from: MessageSender
  text: string
  at: string
  media?: 'foto' | 'video' | 'link' | 'imovel'
}

export interface AiConversation {
  id: string
  realtorId: number
  contactName: string
  contactPhone: string
  status: ConversationStatus
  intent: string
  summary: string
  unread: boolean
  updatedAt: string
  messages: AiMessage[]
  handledBy: 'ia' | 'humano'
}

export interface AiAlert {
  id: string
  realtorId: number
  level: 'info' | 'warning' | 'critical'
  title: string
  detail: string
  at: string
  resolved: boolean
}

export interface AiMetrics {
  conversations: number
  leadsQualified: number
  visitsScheduled: number
  handoffs: number
  avgResponseSeconds: number
  periodLabel: string
}

export interface AiConsumption {
  messagesUsed: number
  messagesLimit: number
  followUpsSent: number
  estimatedCost: number
  periodLabel: string
}

export interface AiIntegration {
  id: string
  realtorId: number
  realtorName: string
  status: AiIntegrationStatus
  price: number
  provisionalPrice: boolean
  paymentStatus: 'nao_iniciado' | 'pendente' | 'confirmado' | 'estornado'
  paymentMethod?: string
  createdAt: string
  updatedAt: string
  whatsappConnected: boolean
  config: AiAgentConfig
  conversations: AiConversation[]
  metrics: AiMetrics
  consumption: AiConsumption
  alerts: AiAlert[]
  history: { id: string; label: string; at: string }[]
  billingNote: string
}

export const aiCapabilities = [
  'Receber o cliente no WhatsApp',
  'Identificar intenção de compra, aluguel ou venda',
  'Qualificar o lead com perguntas guiadas',
  'Perguntar localização, tipo, faixa de preço, renda, entrada e financiamento',
  'Consultar somente os imóveis do corretor',
  'Enviar imóveis, fotos, vídeos e links',
  'Agendar visitas e confirmar presença',
  'Registrar lead e atualizar o CRM (simulado)',
  'Realizar follow-up e lembretes',
  'Gerar resumo da conversa',
  'Transferir para atendimento humano em temas sensíveis',
]

export const aiBenefits = [
  'Agente isolado — treinado só com os seus dados',
  'Atendimento 24h com regras do seu tom de voz',
  'Qualificação automática sem misturar carteiras',
  'Transferência imediata para você quando necessário',
  'Métricas de conversas, leads e consumo',
  'Valor inicial sugerido de R$ 97 (provisório)',
]

export const toneOptions = [
  { value: 'consultivo', label: 'Consultivo' },
  { value: 'objetivo', label: 'Objetivo' },
  { value: 'acolhedor', label: 'Acolhedor' },
  { value: 'premium', label: 'Premium' },
]

export const styleOptions = [
  { value: 'formal', label: 'Formal' },
  { value: 'semi-formal', label: 'Semi-formal' },
  { value: 'descontraido', label: 'Descontraído' },
]

export const exampleDialogs = [
  {
    title: 'Qualificação de compra',
    lines: [
      { from: 'cliente', text: 'Oi, vi um apartamento na Zona Sul' },
      { from: 'ia', text: 'Olá! Sou a assistente do Carlos. Qual faixa de preço você busca?' },
      { from: 'cliente', text: 'Até R$ 900 mil, 3 quartos' },
      { from: 'ia', text: 'Perfeito. Separei 2 opções da carteira do Carlos. Quer ver fotos?' },
    ],
  },
  {
    title: 'Transferência humana',
    lines: [
      { from: 'cliente', text: 'Quero negociar desconto urgente' },
      { from: 'ia', text: 'Entendi. Vou chamar o corretor responsável para conduzir a negociação.' },
      { from: 'sistema', text: 'Atendimento transferido para o corretor' },
    ],
  },
]

function defaultConfig(realtorId: number): AiAgentConfig {
  const profile = publicRealtorProfiles.find((p) => p.id === realtorId)
  const props = getRealtorProperties(realtorId)
  return {
    name: `Assistente de ${profile?.firstName || 'Corretor'}`,
    avatar: profile?.photo || '',
    tone: 'consultivo',
    style: 'semi-formal',
    businessHours: 'Seg–Sáb, 09:00–20:00',
    welcomeMessage: `Olá! Sou a assistente virtual de ${profile?.firstName || 'seu corretor'}. Como posso ajudar?`,
    offlineMessage: 'No momento estamos fora do horário. Deixe sua mensagem que retornamos em breve.',
    responseRules: 'Responda apenas sobre imóveis e serviços deste corretor. Não invente valores.',
    limits: 'Não fecha contrato, não solicita dados bancários, não compartilha dados de outros clientes.',
    faqs: [
      'Quais bairros você atende?',
      'Aceita financiamento?',
      'Posso agendar visita no fim de semana?',
    ],
    knowledgeBase: [
      'Carteira exclusiva do corretor',
      'Regiões de atuação cadastradas',
      'Política de visitas e documentação',
    ],
    authorizedPropertyIds: props.filter((p) => p.status === 'available').map((p) => p.id),
    humanHandoffEnabled: true,
    triggerWords: ['advogado', 'processo', 'desconto urgente', 'pix', 'depósito', 'reclamação'],
    followUpEnabled: true,
    followUpHours: 24,
    remindersEnabled: true,
    whatsappNumber: profile?.whatsapp || '',
    whatsappLabel: profile?.phone || '',
  }
}

function sampleConversations(realtorId: number): AiConversation[] {
  const profile = publicRealtorProfiles.find((p) => p.id === realtorId)
  const props = getRealtorProperties(realtorId)
  const firstTitle = props[0]?.title || 'Imóvel disponível'
  return [
    {
      id: `c-${realtorId}-1`,
      realtorId,
      contactName: 'Fernanda Souza',
      contactPhone: '(11) 97777-2211',
      status: 'ia',
      intent: 'Comprar apartamento',
      summary: 'Busca 2–3 quartos até R$ 850 mil. Já recebeu opções.',
      unread: true,
      updatedAt: '2026-07-28 10:42',
      handledBy: 'ia',
      messages: [
        { id: 'm1', from: 'cliente', text: 'Oi, ainda tem apartamento perto do metrô?', at: '10:30' },
        {
          id: 'm2',
          from: 'ia',
          text: `Olá, Fernanda! Sou a assistente de ${profile?.firstName}. Qual faixa de preço e quantos quartos?`,
          at: '10:31',
        },
        { id: 'm3', from: 'cliente', text: 'Até 850 mil, 3 quartos', at: '10:35' },
        {
          id: 'm4',
          from: 'ia',
          text: `Encontrei na carteira: ${firstTitle}. Posso enviar fotos e o link?`,
          at: '10:36',
          media: 'imovel',
        },
      ],
    },
    {
      id: `c-${realtorId}-2`,
      realtorId,
      contactName: 'Ricardo Almeida',
      contactPhone: '(11) 96666-3344',
      status: 'humano',
      intent: 'Negociação sensível',
      summary: 'Pediu desconto agressivo — transferido por palavra-chave.',
      unread: false,
      updatedAt: '2026-07-27 18:10',
      handledBy: 'humano',
      messages: [
        { id: 'm1', from: 'cliente', text: 'Quero desconto urgente no valor anunciado', at: '17:55' },
        {
          id: 'm2',
          from: 'ia',
          text: 'Identifiquei um tema sensível. Vou transferir para o corretor responsável.',
          at: '17:56',
        },
        { id: 'm3', from: 'sistema', text: 'Atendimento assumido pelo corretor', at: '17:57' },
        {
          id: 'm4',
          from: 'corretor',
          text: 'Ricardo, posso te atender agora. Qual sua proposta?',
          at: '18:00',
        },
      ],
    },
    {
      id: `c-${realtorId}-3`,
      realtorId,
      contactName: 'Juliana Prado',
      contactPhone: '(11) 95555-8899',
      status: 'aguardando',
      intent: 'Agendar visita',
      summary: 'Aguardando confirmação de horário para sábado.',
      unread: false,
      updatedAt: '2026-07-26 15:20',
      handledBy: 'ia',
      messages: [
        { id: 'm1', from: 'cliente', text: 'Posso visitar sábado de manhã?', at: '15:00' },
        {
          id: 'm2',
          from: 'ia',
          text: 'Claro! Tenho 10:00 e 11:30. Qual prefere?',
          at: '15:01',
        },
      ],
    },
  ]
}

export let aiIntegrations: AiIntegration[] = []

const STORAGE_KEY = 'phase13AiIntegrations'

export function loadAiIntegrations(): AiIntegration[] {
  if (typeof window === 'undefined') return aiIntegrations
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return aiIntegrations
    aiIntegrations = JSON.parse(raw) as AiIntegration[]
    return aiIntegrations
  } catch {
    return aiIntegrations
  }
}

export function saveAiIntegrations(list: AiIntegration[]) {
  aiIntegrations = list
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }
}

export function getAllAiIntegrations(): AiIntegration[] {
  return loadAiIntegrations()
}

export function getAiById(id: string): AiIntegration | undefined {
  return loadAiIntegrations().find((i) => i.id === id)
}

export function getRealtorAi(realtorId?: number | null): AiIntegration | null {
  const id = realtorId ?? getCurrentRealtorId()
  if (id === null) return null
  const items = loadAiIntegrations().filter((i) => i.realtorId === id)
  if (!items.length) return null
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
}

export function getScopedAiIntegrations(): AiIntegration[] {
  return filterByRealtor(loadAiIntegrations())
}

export function upsertAi(integration: AiIntegration) {
  const list = loadAiIntegrations()
  const idx = list.findIndex((i) => i.id === integration.id)
  if (idx >= 0) list[idx] = integration
  else list.unshift(integration)
  saveAiIntegrations(list)
  return integration
}

export function createAiDraft(realtorId: number, realtorName: string): AiIntegration {
  const existing = getRealtorAi(realtorId)
  if (existing && existing.status !== 'cancelado' && existing.status !== 'nao_contratado') {
    return existing
  }
  const draft: AiIntegration = {
    id: `ai-${Date.now()}`,
    realtorId,
    realtorName,
    status: 'aguardando_pagamento',
    price: AI_INTEGRATION_PRICE,
    provisionalPrice: true,
    paymentStatus: 'pendente',
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    whatsappConnected: false,
    config: defaultConfig(realtorId),
    conversations: [],
    metrics: {
      conversations: 0,
      leadsQualified: 0,
      visitsScheduled: 0,
      handoffs: 0,
      avgResponseSeconds: 0,
      periodLabel: 'Pré-ativação',
    },
    consumption: {
      messagesUsed: 0,
      messagesLimit: 3000,
      followUpsSent: 0,
      estimatedCost: AI_INTEGRATION_PRICE,
      periodLabel: 'Pré-ativação',
    },
    alerts: [],
    history: [
      {
        id: `h-${Date.now()}`,
        label: 'Solicitação iniciada',
        at: new Date().toLocaleString('pt-BR'),
      },
    ],
    billingNote: 'Valor inicial sugerido R$ 97 (provisório).',
  }
  return upsertAi(draft)
}

export function updateAiStatus(
  id: string,
  status: AiIntegrationStatus,
  note?: string
): AiIntegration | undefined {
  const current = getAiById(id)
  if (!current) return undefined
  const updated: AiIntegration = {
    ...current,
    status,
    updatedAt: new Date().toISOString().slice(0, 10),
    history: [
      {
        id: `h-${Date.now()}`,
        label: note || aiStatusLabels[status],
        at: new Date().toLocaleString('pt-BR'),
      },
      ...current.history,
    ],
  }
  return upsertAi(updated)
}

export function getAuthorizedProperties(integration: AiIntegration) {
  const all = getRealtorProperties(integration.realtorId)
  return all.filter((p) => integration.config.authorizedPropertyIds.includes(p.id))
}

export function emptyAgentForm(realtorId: number): AiAgentConfig {
  return defaultConfig(realtorId)
}

export { formatCurrency, getCurrentRealtorId, getRealtorProperties }
