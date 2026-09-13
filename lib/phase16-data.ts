import { filterByRealtor, formatCurrency, getCurrentRealtorId } from '@/lib/phase7-data'
import { getUserEmail, isSuperAdmin, isSupportAgent } from '@/lib/auth'

export type TicketCategory =
  | 'acesso'
  | 'conta'
  | 'assinatura'
  | 'pagamento'
  | 'imovel'
  | 'cliente'
  | 'crm'
  | 'pagina_profissional'
  | 'ia'
  | 'whatsapp'
  | 'integracao'
  | 'erro'
  | 'sugestao'
  | 'outros'

export type TicketStatus =
  | 'novo'
  | 'em_analise'
  | 'em_atendimento'
  | 'aguardando_corretor'
  | 'aguardando_equipe'
  | 'resolvido'
  | 'encerrado'
  | 'reaberto'

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente'

export type RequestType =
  | 'pagina_profissional'
  | 'ia'
  | 'dominio'
  | 'alteracao_plano'
  | 'cancelamento'
  | 'usuario_adicional'
  | 'servico_personalizado'

export type RequestStatus =
  | 'nova'
  | 'em_analise'
  | 'em_andamento'
  | 'aguardando_corretor'
  | 'concluida'
  | 'recusada'
  | 'cancelada'

export type NotificationType =
  | 'novos_leads'
  | 'mensagens'
  | 'visitas'
  | 'propostas'
  | 'contratos'
  | 'pagamentos'
  | 'assinatura'
  | 'pagina_profissional'
  | 'ia'
  | 'suporte'
  | 'avisos_sistema'
  | 'atualizacoes'
  | 'manutencao'

export interface HelpArticle {
  id: string
  title: string
  category: TicketCategory
  summary: string
  body: string
  tags: string[]
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  category: TicketCategory
}

export interface TicketMessage {
  id: string
  author: 'corretor' | 'suporte' | 'sistema'
  authorName: string
  body: string
  at: string
  attachmentNames?: string[]
}

export interface TicketTimelineEvent {
  id: string
  label: string
  at: string
  actor: string
}

export interface InternalNote {
  id: string
  body: string
  authorName: string
  at: string
}

export interface SupportTicket {
  id: string
  realtorId: number
  realtorName: string
  category: TicketCategory
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  assigneeId?: string
  assigneeName?: string
  attachmentNames: string[]
  messages: TicketMessage[]
  timeline: TicketTimelineEvent[]
  internalNotes: InternalNote[]
  rating?: number
  ratingComment?: string
  createdAt: string
  updatedAt: string
  slaDueAt: string
  slaBreached?: boolean
}

export interface ServiceRequest {
  id: string
  realtorId: number
  realtorName: string
  type: RequestType
  title: string
  description: string
  status: RequestStatus
  amount?: number
  assigneeName?: string
  timeline: TicketTimelineEvent[]
  internalNotes: InternalNote[]
  createdAt: string
  updatedAt: string
}

export interface AppNotification {
  id: string
  realtorId: number | null
  type: NotificationType
  title: string
  message: string
  read: boolean
  href?: string
  createdAt: string
}

export interface SupportAgent {
  id: string
  name: string
  email: string
}

const TICKETS_KEY = 'imovelhub_support_tickets'
const REQUESTS_KEY = 'imovelhub_service_requests'
const NOTIFS_KEY = 'imovelhub_notifications'

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  acesso: 'Acesso',
  conta: 'Conta',
  assinatura: 'Assinatura',
  pagamento: 'Pagamento',
  imovel: 'Imóvel',
  cliente: 'Cliente',
  crm: 'CRM',
  pagina_profissional: 'Página profissional',
  ia: 'IA',
  whatsapp: 'WhatsApp',
  integracao: 'Integração',
  erro: 'Erro',
  sugestao: 'Sugestão',
  outros: 'Outros',
}

export const ticketStatusLabels: Record<TicketStatus, string> = {
  novo: 'Novo',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_corretor: 'Aguardando corretor',
  aguardando_equipe: 'Aguardando equipe',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
  reaberto: 'Reaberto',
}

export const ticketStatusBadge: Record<
  TicketStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'
> = {
  novo: 'info',
  em_analise: 'warning',
  em_atendimento: 'primary',
  aguardando_corretor: 'warning',
  aguardando_equipe: 'warning',
  resolvido: 'success',
  encerrado: 'default',
  reaberto: 'destructive',
}

export const priorityLabels: Record<TicketPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export const priorityBadge: Record<
  TicketPriority,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'
> = {
  baixa: 'default',
  media: 'info',
  alta: 'warning',
  urgente: 'destructive',
}

export const requestTypeLabels: Record<RequestType, string> = {
  pagina_profissional: 'Página profissional',
  ia: 'IA',
  dominio: 'Domínio',
  alteracao_plano: 'Alteração de plano',
  cancelamento: 'Cancelamento',
  usuario_adicional: 'Usuário adicional',
  servico_personalizado: 'Serviço personalizado',
}

export const requestStatusLabels: Record<RequestStatus, string> = {
  nova: 'Nova',
  em_analise: 'Em análise',
  em_andamento: 'Em andamento',
  aguardando_corretor: 'Aguardando corretor',
  concluida: 'Concluída',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
}

export const requestStatusBadge: Record<
  RequestStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'
> = {
  nova: 'info',
  em_analise: 'warning',
  em_andamento: 'primary',
  aguardando_corretor: 'warning',
  concluida: 'success',
  recusada: 'destructive',
  cancelada: 'default',
}

export const notificationTypeLabels: Record<NotificationType, string> = {
  novos_leads: 'Novos leads',
  mensagens: 'Mensagens',
  visitas: 'Visitas',
  propostas: 'Propostas',
  contratos: 'Contratos',
  pagamentos: 'Pagamentos',
  assinatura: 'Assinatura',
  pagina_profissional: 'Página profissional',
  ia: 'IA',
  suporte: 'Suporte',
  avisos_sistema: 'Avisos do sistema',
  atualizacoes: 'Atualizações',
  manutencao: 'Manutenção',
}

export const supportAgents: SupportAgent[] = [
  { id: 'sa-1', name: 'Ana Suporte', email: 'ana.suporte@imovel.hub' },
  { id: 'sa-2', name: 'Bruno Atendimento', email: 'bruno.suporte@imovel.hub' },
  { id: 'sa-3', name: 'Carla SLA', email: 'carla.suporte@imovel.hub' },
]

export const helpArticles: HelpArticle[] = [
  {
    id: 'art-1',
    title: 'Como cadastrar um imóvel com fotos',
    category: 'imovel',
    summary: 'Passo a passo para publicar imóveis na sua carteira exclusiva.',
    body: 'Em Imóveis > Novo, preencha dados, fotos e status. A publicação fica só na sua vitrine.',
    tags: ['imóvel', 'fotos', 'publicação'],
  },
  {
    id: 'art-2',
    title: 'Entendendo o isolamento por corretor',
    category: 'conta',
    summary: 'Por que leads e imóveis não aparecem para outros corretores.',
    body: 'Cada conta opera uma carteira isolada. Não há concorrência interna de imóveis ou clientes.',
    tags: ['segurança', 'isolamento'],
  },
  {
    id: 'art-3',
    title: 'Como solicitar a página profissional (R$ 497)',
    category: 'pagina_profissional',
    summary: 'Fluxo de solicitação e acompanhamento da produção.',
    body: 'Use Solicitações ou o módulo Página Profissional. O valor de referência é R$ 497.',
    tags: ['página', '497'],
  },
  {
    id: 'art-4',
    title: 'Ativando a IA + WhatsApp (R$ 97 sugerido)',
    category: 'ia',
    summary: 'O que esperar do agente isolado e da transferência humana.',
    body: 'A integração é simulada nesta demo. O valor inicial sugerido é R$ 97.',
    tags: ['ia', 'whatsapp', '97'],
  },
  {
    id: 'art-5',
    title: 'Alterar ou cancelar plano',
    category: 'assinatura',
    summary: 'Onde gerenciar assinatura e faturas simuladas.',
    body: 'Em Planos você compara, altera e acompanha faturas. Preços mensais são provisórios.',
    tags: ['plano', 'assinatura'],
  },
  {
    id: 'art-6',
    title: 'Problemas de acesso e senha',
    category: 'acesso',
    summary: 'Recuperação de acesso e sessão do corretor.',
    body: 'Use Esqueci a senha no login. Se persistir, abra um chamado na categoria Acesso.',
    tags: ['login', 'senha'],
  },
  {
    id: 'art-7',
    title: 'CRM: estágios e follow-up',
    category: 'crm',
    summary: 'Organizando leads sem dispersar no WhatsApp pessoal.',
    body: 'Mova oportunidades pelos estágios e registre contatos no histórico do lead.',
    tags: ['crm', 'leads'],
  },
  {
    id: 'art-8',
    title: 'Área do cliente e privacidade',
    category: 'cliente',
    summary: 'Como o portal do cliente fica vinculado só a você.',
    body: 'Cada cliente acessa o portal do corretor responsável. Dados não são compartilhados entre carteiras.',
    tags: ['cliente', 'portal'],
  },
]

export const faqItems: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Meus imóveis aparecem para outros corretores?',
    answer: 'Não. A carteira é exclusiva e isolada por corretor.',
    category: 'imovel',
  },
  {
    id: 'faq-2',
    question: 'O suporte responde em quanto tempo?',
    answer: 'Nesta demo o SLA é visual. Prioridade urgente aparece destacada na fila.',
    category: 'outros',
  },
  {
    id: 'faq-3',
    question: 'Posso reabrir um chamado resolvido?',
    answer: 'Sim. Em chamados resolvidos ou encerrados há opção de reabertura.',
    category: 'outros',
  },
  {
    id: 'faq-4',
    question: 'Anexos são enviados de verdade?',
    answer: 'Não. Anexos são apenas simulações visuais nesta versão.',
    category: 'outros',
  },
  {
    id: 'faq-5',
    question: 'Como pedir domínio próprio?',
    answer: 'Abra uma solicitação do tipo Domínio na central de solicitações.',
    category: 'pagina_profissional',
  },
  {
    id: 'faq-6',
    question: 'Notificações são enviadas por e-mail/push?',
    answer: 'Não nesta demo. Elas aparecem apenas na central e no sino do topo.',
    category: 'outros',
  },
]

function nowLabel() {
  return new Date().toLocaleString('pt-BR')
}

function hoursFromNow(hours: number) {
  const d = new Date()
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

const seedTickets: SupportTicket[] = []

const seedRequests: ServiceRequest[] = []

const seedNotifications: AppNotification[] = []

function readJson<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw) as T
  } catch {
    return seed
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadTickets(): SupportTicket[] {
  return readJson(TICKETS_KEY, seedTickets)
}

export function saveTickets(list: SupportTicket[]) {
  writeJson(TICKETS_KEY, list)
}

export function loadRequests(): ServiceRequest[] {
  return readJson(REQUESTS_KEY, seedRequests)
}

export function saveRequests(list: ServiceRequest[]) {
  writeJson(REQUESTS_KEY, list)
}

export function loadNotifications(): AppNotification[] {
  return readJson(NOTIFS_KEY, seedNotifications)
}

export function saveNotifications(list: AppNotification[]) {
  writeJson(NOTIFS_KEY, list)
}

export function getSupportAgentByEmail(): SupportAgent | undefined {
  const email = getUserEmail().toLowerCase()
  return supportAgents.find((a) => a.email === email || email.includes(a.id) || email.includes('suporte'))
}

export function getScopedTickets(): SupportTicket[] {
  if (isSuperAdmin()) return loadTickets()
  if (isSupportAgent()) {
    const agent = getSupportAgentByEmail()
    const all = loadTickets()
    if (!agent) return all
    return all.filter((t) => !t.assigneeId || t.assigneeId === agent.id || t.status === 'novo')
  }
  return filterByRealtor(loadTickets())
}

export function getTicketById(id: string): SupportTicket | undefined {
  return getScopedTickets().find((t) => t.id === id)
}

export function upsertTicket(ticket: SupportTicket) {
  const list = loadTickets()
  const idx = list.findIndex((t) => t.id === ticket.id)
  if (idx >= 0) list[idx] = ticket
  else list.unshift(ticket)
  saveTickets(list)
}

export function getScopedRequests(): ServiceRequest[] {
  if (isSuperAdmin() || isSupportAgent()) return loadRequests()
  return filterByRealtor(loadRequests())
}

export function getRequestById(id: string): ServiceRequest | undefined {
  return getScopedRequests().find((r) => r.id === id)
}

export function upsertRequest(req: ServiceRequest) {
  const list = loadRequests()
  const idx = list.findIndex((r) => r.id === req.id)
  if (idx >= 0) list[idx] = req
  else list.unshift(req)
  saveRequests(list)
}

export function getScopedNotifications(): AppNotification[] {
  const all = loadNotifications()
  if (isSuperAdmin() || isSupportAgent()) return all
  const realtorId = getCurrentRealtorId()
  return all.filter((n) => n.realtorId === null || n.realtorId === realtorId)
}

export function markNotificationRead(id: string) {
  const list = loadNotifications().map((n) => (n.id === id ? { ...n, read: true } : n))
  saveNotifications(list)
}

export function markAllNotificationsRead() {
  const scoped = new Set(getScopedNotifications().map((n) => n.id))
  const list = loadNotifications().map((n) => (scoped.has(n.id) ? { ...n, read: true } : n))
  saveNotifications(list)
}

export function unreadNotificationCount(): number {
  return getScopedNotifications().filter((n) => !n.read).length
}

export function createTicket(input: {
  category: TicketCategory
  subject: string
  description: string
  priority: TicketPriority
  attachmentNames: string[]
  realtorId: number
  realtorName: string
}): SupportTicket {
  const ticket: SupportTicket = {
    id: `tk-${Date.now()}`,
    realtorId: input.realtorId,
    realtorName: input.realtorName,
    category: input.category,
    subject: input.subject,
    description: input.description,
    priority: input.priority,
    status: 'novo',
    attachmentNames: input.attachmentNames,
    messages: [
      {
        id: `m-${Date.now()}`,
        author: 'corretor',
        authorName: input.realtorName,
        body: input.description,
        at: nowLabel(),
        attachmentNames: input.attachmentNames,
      },
    ],
    timeline: [
      { id: `t-${Date.now()}`, label: 'Chamado aberto', at: nowLabel(), actor: input.realtorName },
    ],
    internalNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDueAt: hoursFromNow(input.priority === 'urgente' ? 4 : input.priority === 'alta' ? 8 : 24),
  }
  upsertTicket(ticket)
  return ticket
}

export function createServiceRequest(input: {
  type: RequestType
  title: string
  description: string
  amount?: number
  realtorId: number
  realtorName: string
}): ServiceRequest {
  const req: ServiceRequest = {
    id: `sr-${Date.now()}`,
    realtorId: input.realtorId,
    realtorName: input.realtorName,
    type: input.type,
    title: input.title,
    description: input.description,
    status: 'nova',
    amount: input.amount,
    timeline: [
      { id: `t-${Date.now()}`, label: 'Solicitação criada', at: nowLabel(), actor: input.realtorName },
    ],
    internalNotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  upsertRequest(req)
  return req
}

export function slaProgress(ticket: SupportTicket): { label: string; percent: number; breached: boolean } {
  const due = new Date(ticket.slaDueAt).getTime()
  const created = new Date(ticket.createdAt).getTime()
  const now = Date.now()
  const total = Math.max(due - created, 1)
  const elapsed = now - created
  const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  const breached =
    ticket.slaBreached ||
    (now > due && !['resolvido', 'encerrado'].includes(ticket.status))
  const hoursLeft = Math.round((due - now) / 3600000)
  return {
    breached,
    percent: breached ? 100 : percent,
    label: breached
      ? 'SLA estourado'
      : hoursLeft <= 0
        ? 'Prazo próximo'
        : `${hoursLeft}h restantes`,
  }
}

export function supportReportMetrics(tickets = loadTickets()) {
  const open = tickets.filter((t) => !['resolvido', 'encerrado'].includes(t.status)).length
  const resolved = tickets.filter((t) => t.status === 'resolvido' || t.status === 'encerrado').length
  const rated = tickets.filter((t) => typeof t.rating === 'number')
  const avgRating =
    rated.length === 0
      ? 0
      : Math.round((rated.reduce((s, t) => s + (t.rating || 0), 0) / rated.length) * 10) / 10
  const breached = tickets.filter((t) => slaProgress(t).breached).length
  const byPriority = {
    urgente: tickets.filter((t) => t.priority === 'urgente' && !['resolvido', 'encerrado'].includes(t.status)).length,
    alta: tickets.filter((t) => t.priority === 'alta' && !['resolvido', 'encerrado'].includes(t.status)).length,
    media: tickets.filter((t) => t.priority === 'media' && !['resolvido', 'encerrado'].includes(t.status)).length,
    baixa: tickets.filter((t) => t.priority === 'baixa' && !['resolvido', 'encerrado'].includes(t.status)).length,
  }
  return { open, resolved, avgRating, breached, byPriority, total: tickets.length }
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins} min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

export { formatCurrency, getCurrentRealtorId, nowLabel }
