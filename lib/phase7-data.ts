import { getUserEmail, getUserRole, getSessionRealtorId, isSuperAdmin } from '@/lib/auth'
import { realtorsList } from '@/lib/mock-data'

export type AppointmentType =
  | 'visita'
  | 'tarefa'
  | 'ligacao'
  | 'reuniao'
  | 'follow_up'
  | 'pessoal'
  | 'lembrete'

export type AppointmentStatus =
  | 'agendado'
  | 'confirmado'
  | 'reagendado'
  | 'concluido'
  | 'cancelado'

export type VisitStatus =
  | 'aguardando_confirmacao'
  | 'confirmada'
  | 'reagendada'
  | 'realizada'
  | 'cliente_nao_compareceu'
  | 'corretor_nao_compareceu'
  | 'cancelada'

export type NegotiationStatus =
  | 'proposta_em_preparacao'
  | 'proposta_enviada'
  | 'aguardando_proprietario'
  | 'contraproposta'
  | 'em_negociacao'
  | 'documentacao'
  | 'aprovada'
  | 'recusada'
  | 'fechada'
  | 'cancelada'

export interface Appointment {
  id: string
  title: string
  type: AppointmentType
  status: AppointmentStatus
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  location?: string
  notes?: string
  reminder: boolean
  reminderMinutes: number
  clientName?: string
  propertyTitle?: string
  propertyId?: number
  realtorId: number
  realtorName: string
  visitStatus?: VisitStatus
  confirmed: boolean
  createdAt: string
  updatedAt: string
}

export interface NegotiationDocument {
  id: string
  name: string
  status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado'
  required: boolean
  dueDate?: string
}

export interface TimelineEvent {
  id: string
  date: string
  time: string
  title: string
  description: string
  actor: string
  type: 'status' | 'proposta' | 'contraproposta' | 'documento' | 'observacao' | 'aprovacao' | 'sistema'
}

export interface ChecklistItem {
  id: string
  label: string
  done: boolean
  required: boolean
}

export interface Negotiation {
  id: string
  code: string
  clientName: string
  clientEmail: string
  clientPhone: string
  propertyId: number
  propertyTitle: string
  propertyAddress: string
  ownerName: string
  ownerEmail: string
  realtorId: number
  realtorName: string
  requestedValue: number
  offeredValue: number
  downPayment: number
  financing: number
  conditions: string
  deadline: string
  commissionPercent: number
  commissionValue: number
  status: NegotiationStatus
  observations: string
  documents: NegotiationDocument[]
  timeline: TimelineEvent[]
  checklist: ChecklistItem[]
  contractReady: boolean
  signatureStatus: 'nao_iniciada' | 'aguardando' | 'assinada' | 'recusada'
  createdAt: string
  updatedAt: string
}

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  visita: 'Visita',
  tarefa: 'Tarefa',
  ligacao: 'Ligação',
  reuniao: 'Reunião',
  follow_up: 'Follow-up',
  pessoal: 'Evento pessoal',
  lembrete: 'Lembrete',
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  reagendado: 'Reagendado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const visitStatusLabels: Record<VisitStatus, string> = {
  aguardando_confirmacao: 'Aguardando confirmação',
  confirmada: 'Confirmada',
  reagendada: 'Reagendada',
  realizada: 'Realizada',
  cliente_nao_compareceu: 'Cliente não compareceu',
  corretor_nao_compareceu: 'Corretor não compareceu',
  cancelada: 'Cancelada',
}

export const negotiationStatusLabels: Record<NegotiationStatus, string> = {
  proposta_em_preparacao: 'Proposta em preparação',
  proposta_enviada: 'Proposta enviada',
  aguardando_proprietario: 'Aguardando proprietário',
  contraproposta: 'Contraproposta',
  em_negociacao: 'Em negociação',
  documentacao: 'Documentação',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
  fechada: 'Fechada',
  cancelada: 'Cancelada',
}

export interface SelectOption {
  value: string
  label: string
}

export const clientsOptions: SelectOption[] = []

export const propertyOptions: SelectOption[] = []

export const initialAppointments: Appointment[] = []

export const initialNegotiations: Negotiation[] = []

export function getCurrentRealtorId(): number | null {
  if (typeof window === 'undefined') return 1
  // Admin/suporte no realm admin: visão global
  if (isSuperAdmin() || getUserRole() === 'suporte' || getUserRole() === 'financeiro') return null
  const fromSession = getSessionRealtorId()
  if (fromSession != null) return fromSession
  const email = getUserEmail()
  const match = realtorsList.find((r) => r.email === email)
  return match?.id ?? 1
}

export function filterByRealtor<T extends { realtorId: number }>(items: T[]): T[] {
  const realtorId = getCurrentRealtorId()
  if (realtorId === null) return items
  return items.filter((item) => item.realtorId === realtorId)
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDateBR(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR')
}

export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function appointmentStatusBadge(
  status: AppointmentStatus
): 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' {
  const map = {
    agendado: 'info' as const,
    confirmado: 'success' as const,
    reagendado: 'warning' as const,
    concluido: 'primary' as const,
    cancelado: 'destructive' as const,
  }
  return map[status]
}

export function visitStatusBadge(
  status: VisitStatus
): 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' {
  const map: Record<VisitStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'> = {
    aguardando_confirmacao: 'warning',
    confirmada: 'success',
    reagendada: 'info',
    realizada: 'primary',
    cliente_nao_compareceu: 'destructive',
    corretor_nao_compareceu: 'destructive',
    cancelada: 'destructive',
  }
  return map[status]
}

export function negotiationStatusBadge(
  status: NegotiationStatus
): 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' {
  const map: Record<NegotiationStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'> = {
    proposta_em_preparacao: 'default',
    proposta_enviada: 'info',
    aguardando_proprietario: 'warning',
    contraproposta: 'warning',
    em_negociacao: 'primary',
    documentacao: 'info',
    aprovada: 'success',
    recusada: 'destructive',
    fechada: 'success',
    cancelada: 'destructive',
  }
  return map[status]
}
