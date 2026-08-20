import {
  PublicProperty,
  PublicRealtorProfile,
  formatCurrency,
  getPublicRealtorBySlug,
  getRealtorProperties,
  purposeLabel,
  toCardStatus,
} from '@/lib/phase9-data'
import { loadJson } from '@/lib/client-auth'

export type ClientObjective =
  | 'comprar'
  | 'alugar'
  | 'investir'
  | 'financiar'
  | 'vender'
  | 'avaliar'

export interface ClientQualification {
  objective: ClientObjective | ''
  propertyType: string
  city: string
  neighborhood: string
  bedrooms: string
  suites: string
  bathrooms: string
  parking: string
  areaMin: string
  features: string[]
  priceMin: string
  priceMax: string
  incomeRange: string
  familyIncome: string
  downPayment: string
  useFgts: boolean
  needsFinancing: boolean
  creditApproved: boolean
  maxInstallment: string
  purchaseDeadline: string
  contactTime: string
  step: number
}

export interface ClientProfile {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  city: string
  neighborhood: string
}

export interface ClientFinancialProfile {
  familyIncome: string
  incomeRange: string
  downPayment: string
  maxInstallment: string
  useFgts: boolean
  needsFinancing: boolean
  creditApproved: boolean
  bank: string
  notes: string
}

export interface ClientVisit {
  id: string
  propertyId: string
  propertyTitle: string
  date: string
  time: string
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
}

export interface ClientProposal {
  id: string
  propertyId: string
  propertyTitle: string
  value: number
  status: 'enviada' | 'em_analise' | 'aceita' | 'recusada' | 'contraproposta'
  createdAt: string
  message: string
}

export interface ClientDocument {
  id: string
  name: string
  category: string
  status: 'enviado' | 'em_analise' | 'aprovado' | 'pendente'
  updatedAt: string
}

export interface ClientMessage {
  id: string
  from: 'cliente' | 'corretor'
  text: string
  at: string
  read: boolean
}

export interface ClientHistoryItem {
  id: string
  label: string
  detail: string
  at: string
  type: 'visita' | 'proposta' | 'documento' | 'mensagem' | 'preferencia' | 'favorito'
}

export const emptyQualification = (): ClientQualification => ({
  objective: '',
  propertyType: 'apartamento',
  city: 'São Paulo',
  neighborhood: '',
  bedrooms: '2',
  suites: '1',
  bathrooms: '2',
  parking: '1',
  areaMin: '60',
  features: [],
  priceMin: '300000',
  priceMax: '900000',
  incomeRange: '10-20',
  familyIncome: '15000',
  downPayment: '100000',
  useFgts: true,
  needsFinancing: true,
  creditApproved: false,
  maxInstallment: '4500',
  purchaseDeadline: '6-meses',
  contactTime: 'comercial',
  step: 0,
})

export const defaultProfile = (name = '', email = '', phone = ''): ClientProfile => ({
  name,
  email,
  phone,
  cpf: '123.456.789-00',
  birthDate: '1990-05-12',
  city: 'São Paulo',
  neighborhood: 'Vila Mariana',
})

export const defaultFinancial = (): ClientFinancialProfile => ({
  familyIncome: 'R$ 15.000',
  incomeRange: 'R$ 10.000 a R$ 20.000',
  downPayment: 'R$ 100.000',
  maxInstallment: 'R$ 4.500',
  useFgts: true,
  needsFinancing: true,
  creditApproved: false,
  bank: 'A definir',
  notes: '',
})

export const featureOptions = [
  'Varanda',
  'Piscina',
  'Academia',
  'Pet friendly',
  'Mobiliado',
  'Armários planejados',
  'Andar alto',
  'Vista livre',
  'Área gourmet',
  'Quintal',
]

export const objectiveOptions = [
  { value: 'comprar', label: 'Comprar' },
  { value: 'alugar', label: 'Alugar' },
  { value: 'investir', label: 'Investir' },
  { value: 'financiar', label: 'Financiar' },
  { value: 'vender', label: 'Vender meu imóvel' },
  { value: 'avaliar', label: 'Avaliar imóvel' },
]

export const onboardingSteps = [
  { id: 'objetivo', title: 'Objetivo' },
  { id: 'imovel', title: 'Imóvel desejado' },
  { id: 'local', title: 'Localização' },
  { id: 'financeiro', title: 'Perfil financeiro' },
  { id: 'contato', title: 'Contato e prazo' },
  { id: 'resultado', title: 'Compatíveis' },
]

export const demoClient = {
  email: 'ana.cliente@email.com',
  password: 'senha123',
  name: 'Ana Paula Mendes',
  phone: '(11) 98888-1122',
  realtorSlug: 'marina-costa-santos',
}

export function getClientVisits(realtorId: number): ClientVisit[] {
  const props = getRealtorProperties(realtorId)
  if (props.length === 0) return []
  return [
    {
      id: 'v1',
      propertyId: props[0].id,
      propertyTitle: props[0].title,
      date: '2026-08-02',
      time: '10:30',
      status: 'confirmada',
    },
    {
      id: 'v2',
      propertyId: props[1]?.id || props[0].id,
      propertyTitle: props[1]?.title || props[0].title,
      date: '2026-08-05',
      time: '16:00',
      status: 'agendada',
    },
  ]
}

export function getClientProposals(realtorId: number): ClientProposal[] {
  const props = getRealtorProperties(realtorId).filter((p) => p.purpose !== 'aluguel')
  if (props.length === 0) return []
  return [
    {
      id: 'pr1',
      propertyId: props[0].id,
      propertyTitle: props[0].title,
      value: Math.round(props[0].price * 0.95),
      status: 'em_analise',
      createdAt: '2026-07-20',
      message: 'Proposta com entrada de 20% e financiamento do saldo.',
    },
  ]
}

export function getClientDocuments(): ClientDocument[] {
  return [
    { id: 'd1', name: 'RG e CPF.pdf', category: 'Identificação', status: 'aprovado', updatedAt: '2026-07-18' },
    { id: 'd2', name: 'Comprovante de renda.pdf', category: 'Financeiro', status: 'em_analise', updatedAt: '2026-07-22' },
    { id: 'd3', name: 'IRPF 2025.pdf', category: 'Financeiro', status: 'pendente', updatedAt: '2026-07-25' },
  ]
}

export function getClientMessages(realtorName: string): ClientMessage[] {
  return [
    {
      id: 'm1',
      from: 'corretor',
      text: `Olá! Sou ${realtorName}. Já separei opções alinhadas ao seu perfil.`,
      at: '2026-07-21 09:12',
      read: true,
    },
    {
      id: 'm2',
      from: 'cliente',
      text: 'Obrigada! Prefiro visitar no período da tarde.',
      at: '2026-07-21 10:05',
      read: true,
    },
    {
      id: 'm3',
      from: 'corretor',
      text: 'Perfeito. Posso confirmar visita na terça às 16h.',
      at: '2026-07-21 11:40',
      read: false,
    },
  ]
}

export function getClientHistory(realtorName: string): ClientHistoryItem[] {
  return [
    {
      id: 'h1',
      label: 'Preferências atualizadas',
      detail: 'Faixa de preço e bairros revisados',
      at: '2026-07-25 14:20',
      type: 'preferencia',
    },
    {
      id: 'h2',
      label: 'Documento enviado',
      detail: 'Comprovante de renda.pdf',
      at: '2026-07-22 16:05',
      type: 'documento',
    },
    {
      id: 'h3',
      label: 'Proposta registrada',
      detail: 'Aguardando retorno do corretor',
      at: '2026-07-20 11:30',
      type: 'proposta',
    },
    {
      id: 'h4',
      label: `Mensagem de ${realtorName}`,
      detail: 'Sugestão de visita confirmada',
      at: '2026-07-21 11:40',
      type: 'mensagem',
    },
  ]
}

export function matchProperties(
  realtorId: number,
  qualification?: ClientQualification | null
): PublicProperty[] {
  const discarded = typeof window !== 'undefined'
    ? (() => {
        try {
          return JSON.parse(localStorage.getItem('clientDiscarded') || '[]') as string[]
        } catch {
          return [] as string[]
        }
      })()
    : []

  const q = qualification || loadJson('qualification', emptyQualification())
  const all = getRealtorProperties(realtorId).filter(
    (p) => p.status === 'available' && !discarded.includes(p.id)
  )

  const wantRent = q.objective === 'alugar'
  const wantBuy = ['comprar', 'investir', 'financiar'].includes(q.objective)
  const priceMax = Number(q.priceMax) || Infinity
  const priceMin = Number(q.priceMin) || 0
  const beds = Number(q.bedrooms) || 0

  return all
    .map((p) => {
      let score = 0
      if (wantRent && p.purpose === 'aluguel') score += 3
      if (wantBuy && p.purpose !== 'aluguel') score += 3
      if (q.neighborhood && p.neighborhood.toLowerCase().includes(q.neighborhood.toLowerCase())) {
        score += 2
      }
      if (p.price >= priceMin && p.price <= priceMax) score += 2
      if (p.bedrooms >= beds) score += 1
      if (q.propertyType && p.title.toLowerCase().includes(q.propertyType.toLowerCase())) score += 1
      return { p, score }
    })
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .map((x) => x.p)
}

export function getNewProperties(realtorId: number): PublicProperty[] {
  return getRealtorProperties(realtorId)
    .filter((p) => p.status === 'available')
    .slice(0, 4)
}

export function resolveClientRealtor(slug: string): PublicRealtorProfile | undefined {
  return getPublicRealtorBySlug(slug)
}

export function formatPriceLabel(property: PublicProperty): string {
  const value = formatCurrency(property.price)
  return property.purpose === 'aluguel' ? `${value}/mês` : value
}

export const proposalStatusLabel: Record<ClientProposal['status'], string> = {
  enviada: 'Enviada',
  em_analise: 'Em análise',
  aceita: 'Aceita',
  recusada: 'Recusada',
  contraproposta: 'Contraproposta',
}

export const visitStatusLabel: Record<ClientVisit['status'], string> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

export const documentStatusLabel: Record<ClientDocument['status'], string> = {
  enviado: 'Enviado',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  pendente: 'Pendente',
}

export { formatCurrency, purposeLabel, toCardStatus, getRealtorProperties }
