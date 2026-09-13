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
  email: 'cliente@plataforma.com.br',
  password: 'Cliente@123456',
  name: 'Cliente Demonstração',
  phone: '',
  realtorSlug: 'corretor-demonstracao',
}

export function getClientVisits(_realtorId: number): ClientVisit[] {
  return []
}

export function getClientProposals(_realtorId: number): ClientProposal[] {
  return []
}

export function getClientDocuments(): ClientDocument[] {
  return []
}

export function getClientMessages(_realtorName: string): ClientMessage[] {
  return []
}

export function getClientHistory(_realtorName: string): ClientHistoryItem[] {
  return []
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
