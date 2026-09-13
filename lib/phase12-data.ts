import { filterByRealtor, formatCurrency, getCurrentRealtorId } from '@/lib/phase7-data'
import { publicRealtorProfiles } from '@/lib/phase9-data'

export const PROFESSIONAL_PAGE_PRICE = 497

export type ProfessionalRequestStatus =
  | 'nao_contratado'
  | 'solicitacao_iniciada'
  | 'aguardando_informacoes'
  | 'aguardando_materiais'
  | 'aguardando_pagamento'
  | 'pagamento_confirmado'
  | 'em_producao'
  | 'em_revisao_interna'
  | 'aguardando_aprovacao_corretor'
  | 'ajustes_solicitados'
  | 'aprovado'
  | 'publicado'
  | 'suspenso'
  | 'cancelado'

export const professionalStatusLabels: Record<ProfessionalRequestStatus, string> = {
  nao_contratado: 'Não contratado',
  solicitacao_iniciada: 'Solicitação iniciada',
  aguardando_informacoes: 'Aguardando informações',
  aguardando_materiais: 'Aguardando materiais',
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_confirmado: 'Pagamento confirmado',
  em_producao: 'Em produção',
  em_revisao_interna: 'Em revisão interna',
  aguardando_aprovacao_corretor: 'Aguardando aprovação do corretor',
  ajustes_solicitados: 'Ajustes solicitados',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
  suspenso: 'Suspenso',
  cancelado: 'Cancelado',
}

export const professionalStatusBadge: Record<
  ProfessionalRequestStatus,
  'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'
> = {
  nao_contratado: 'default',
  solicitacao_iniciada: 'info',
  aguardando_informacoes: 'warning',
  aguardando_materiais: 'warning',
  aguardando_pagamento: 'warning',
  pagamento_confirmado: 'success',
  em_producao: 'primary',
  em_revisao_interna: 'info',
  aguardando_aprovacao_corretor: 'warning',
  ajustes_solicitados: 'warning',
  aprovado: 'success',
  publicado: 'success',
  suspenso: 'destructive',
  cancelado: 'destructive',
}

export interface TimelineEvent {
  id: string
  status: ProfessionalRequestStatus
  label: string
  at: string
  note?: string
}

export interface ProfessionalMaterial {
  id: string
  name: string
  type: string
  status: 'pendente' | 'enviado' | 'aprovado'
}

export interface ProfessionalMessage {
  id: string
  from: 'corretor' | 'producao' | 'admin'
  text: string
  at: string
}

export interface ProfessionalChecklistItem {
  id: string
  label: string
  done: boolean
}

export interface ProfessionalPageMetrics {
  visits: number
  leads: number
  whatsappClicks: number
  conversionRate: number
  periodLabel: string
}

export interface ProfessionalRequestForm {
  fullName: string
  creci: string
  phone: string
  email: string
  bio: string
  photoName: string
  logoName: string
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  videoUrl: string
  specialties: string[]
  regions: string[]
  testimonials: string
  primaryColor: string
  secondaryColor: string
  modelId: string
  slug: string
  customDomain: string
  wantsDomain: boolean
  materialsNote: string
}

export interface ProfessionalRequest {
  id: string
  realtorId: number
  realtorName: string
  status: ProfessionalRequestStatus
  price: number
  createdAt: string
  updatedAt: string
  dueDate: string
  producer: string
  form: ProfessionalRequestForm
  materials: ProfessionalMaterial[]
  timeline: TimelineEvent[]
  checklist: ProfessionalChecklistItem[]
  messages: ProfessionalMessage[]
  adjustments: string[]
  publishedUrl?: string
  paymentMethod?: string
  paymentStatus: 'pendente' | 'confirmado' | 'estornado' | 'nao_iniciado'
  metrics?: ProfessionalPageMetrics
}

export interface VisualModel {
  id: string
  name: string
  style: string
  description: string
  image: string
  highlights: string[]
}

export const visualModels: VisualModel[] = [
  {
    id: 'modelo-elegante',
    name: 'Elegante',
    style: 'Sofisticado',
    description: 'Tipografia limpa, hero full-bleed e foco em autoridade consultiva.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=600&fit=crop',
    highlights: ['Hero imersivo', 'Depoimentos em destaque', 'CTA WhatsApp'],
  },
  {
    id: 'modelo-moderno',
    name: 'Moderno',
    style: 'Urbano',
    description: 'Layout dinâmico para corretores de alto volume e lançamentos.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=600&fit=crop',
    highlights: ['Cards de imóveis', 'Vídeo no topo', 'Campanha integrada'],
  },
  {
    id: 'modelo-classico',
    name: 'Clássico',
    style: 'Institucional',
    description: 'Tom sóbrio para quem atua com patrimônio e famílias.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c251b00?w=900&h=600&fit=crop',
    highlights: ['Biografia completa', 'Regiões de atuação', 'Avaliação de imóvel'],
  },
]

export const benefitsList = [
  'Página exclusiva vinculada à sua marca',
  'Design premium alinhado ao Design System ImóvelHub',
  'Formulários de lead e WhatsApp direcionados a você',
  'SEO básico e slug personalizado',
  'Galeria, vídeo e depoimentos',
  'Suporte de produção com revisões',
  'Métricas de visitas e conversão (simuladas)',
  'Opção de domínio próprio (solicitação)',
]

export const beforeAfter = {
  before: [
    'Perfil genérico em redes sociais',
    'Leads dispersos e sem rastreio',
    'Sem vitrine própria de imóveis',
    'Pouca percepção de autoridade',
  ],
  after: [
    'Página profissional com sua identidade',
    'Leads centralizados no seu atendimento',
    'Carteira apresentada com curadoria',
    'Presença digital premium e memorável',
  ],
}

export const examplePages = publicRealtorProfiles.slice(0, 3).map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  creci: p.creci,
  photo: p.photo,
  cover: p.coverImage,
  promise: p.promise,
}))

export const specialtyOptions = [
  'Apartamentos',
  'Casas',
  'Lançamentos',
  'Alto padrão',
  'Investimento',
  'Comercial',
  'Primeira compra',
  'Locação',
]

export const regionOptions = [
  'Zona Sul',
  'Zona Oeste',
  'Centro',
  'Alphaville',
  'Jardins',
  'Moema',
  'Vila Mariana',
  'Barra da Tijuca',
]

export function emptyForm(realtorId = 1): ProfessionalRequestForm {
  const profile = publicRealtorProfiles.find((p) => p.id === realtorId)
  return {
    fullName: profile?.name || '',
    creci: profile?.creci || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    photoName: '',
    logoName: '',
    instagram: profile?.social.instagram || '',
    facebook: profile?.social.facebook || '',
    linkedin: profile?.social.linkedin || '',
    youtube: profile?.social.youtube || '',
    videoUrl: '',
    specialties: profile?.specialties.slice(0, 3) || [],
    regions: profile?.regions.slice(0, 3) || [],
    testimonials: '',
    primaryColor: '#F97316',
    secondaryColor: '#0F172A',
    modelId: 'modelo-elegante',
    slug: profile?.slug || '',
    customDomain: '',
    wantsDomain: false,
    materialsNote: '',
  }
}

function buildTimeline(
  status: ProfessionalRequestStatus,
  extras: TimelineEvent[] = []
): TimelineEvent[] {
  const base: TimelineEvent[] = [
    {
      id: 't1',
      status: 'solicitacao_iniciada',
      label: 'Solicitação iniciada',
      at: '2026-07-10 09:00',
    },
  ]
  const map: Partial<Record<ProfessionalRequestStatus, TimelineEvent>> = {
    aguardando_informacoes: {
      id: 't2',
      status: 'aguardando_informacoes',
      label: 'Aguardando informações',
      at: '2026-07-10 11:20',
    },
    aguardando_materiais: {
      id: 't3',
      status: 'aguardando_materiais',
      label: 'Aguardando materiais',
      at: '2026-07-11 14:00',
    },
    aguardando_pagamento: {
      id: 't4',
      status: 'aguardando_pagamento',
      label: 'Aguardando pagamento',
      at: '2026-07-12 10:15',
    },
    pagamento_confirmado: {
      id: 't5',
      status: 'pagamento_confirmado',
      label: 'Pagamento confirmado (R$ 497,00)',
      at: '2026-07-12 16:40',
    },
    em_producao: {
      id: 't6',
      status: 'em_producao',
      label: 'Produção iniciada',
      at: '2026-07-13 09:30',
    },
    em_revisao_interna: {
      id: 't7',
      status: 'em_revisao_interna',
      label: 'Revisão interna',
      at: '2026-07-18 15:00',
    },
    aguardando_aprovacao_corretor: {
      id: 't8',
      status: 'aguardando_aprovacao_corretor',
      label: 'Enviado para aprovação do corretor',
      at: '2026-07-19 11:00',
    },
    ajustes_solicitados: {
      id: 't9',
      status: 'ajustes_solicitados',
      label: 'Ajustes solicitados',
      at: '2026-07-20 09:45',
    },
    aprovado: {
      id: 't10',
      status: 'aprovado',
      label: 'Aprovado pelo corretor',
      at: '2026-07-22 17:20',
    },
    publicado: {
      id: 't11',
      status: 'publicado',
      label: 'Página publicada',
      at: '2026-07-23 10:00',
    },
  }

  const order: ProfessionalRequestStatus[] = [
    'solicitacao_iniciada',
    'aguardando_informacoes',
    'aguardando_materiais',
    'aguardando_pagamento',
    'pagamento_confirmado',
    'em_producao',
    'em_revisao_interna',
    'aguardando_aprovacao_corretor',
    'ajustes_solicitados',
    'aprovado',
    'publicado',
  ]

  const idx = order.indexOf(status)
  const events = [...base]
  order.forEach((key, i) => {
    if (i === 0) return
    if (idx >= i && map[key]) events.push(map[key]!)
  })
  return [...events, ...extras]
}

const defaultChecklist = (): ProfessionalChecklistItem[] => [
  { id: 'ck1', label: 'Briefing completo', done: true },
  { id: 'ck2', label: 'Materiais recebidos', done: true },
  { id: 'ck3', label: 'Pagamento confirmado', done: true },
  { id: 'ck4', label: 'Layout em produção', done: true },
  { id: 'ck5', label: 'Revisão interna', done: false },
  { id: 'ck6', label: 'Aprovação do corretor', done: false },
  { id: 'ck7', label: 'Publicação', done: false },
]

export let professionalRequests: ProfessionalRequest[] = []

const STORAGE_KEY = 'phase12ProfessionalRequests'

export function loadProfessionalRequests(): ProfessionalRequest[] {
  if (typeof window === 'undefined') return professionalRequests
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return professionalRequests
    professionalRequests = JSON.parse(raw) as ProfessionalRequest[]
    return professionalRequests
  } catch {
    return professionalRequests
  }
}

export function saveProfessionalRequests(list: ProfessionalRequest[]) {
  professionalRequests = list
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }
}

export function getRealtorProfessionalRequest(realtorId?: number | null): ProfessionalRequest | null {
  const list = loadProfessionalRequests()
  const id = realtorId ?? getCurrentRealtorId()
  if (id === null) return null
  const items = list.filter((r) => r.realtorId === id)
  if (items.length === 0) return null
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
}

export function getAllProfessionalRequests(): ProfessionalRequest[] {
  return loadProfessionalRequests()
}

export function getProfessionalRequestById(id: string): ProfessionalRequest | undefined {
  return loadProfessionalRequests().find((r) => r.id === id)
}

export function upsertProfessionalRequest(request: ProfessionalRequest) {
  const list = loadProfessionalRequests()
  const idx = list.findIndex((r) => r.id === request.id)
  if (idx >= 0) list[idx] = request
  else list.unshift(request)
  saveProfessionalRequests(list)
  return request
}

export function updateRequestStatus(
  id: string,
  status: ProfessionalRequestStatus,
  note?: string
): ProfessionalRequest | undefined {
  const current = getProfessionalRequestById(id)
  if (!current) return undefined
  const event: TimelineEvent = {
    id: `t-${Date.now()}`,
    status,
    label: professionalStatusLabels[status],
    at: new Date().toLocaleString('pt-BR'),
    note,
  }
  const updated: ProfessionalRequest = {
    ...current,
    status,
    updatedAt: new Date().toISOString().slice(0, 10),
    timeline: [...current.timeline, event],
    publishedUrl:
      status === 'publicado'
        ? current.publishedUrl || `/corretor/${current.form.slug}`
        : current.publishedUrl,
    paymentStatus:
      status === 'pagamento_confirmado' ||
      [
        'em_producao',
        'em_revisao_interna',
        'aguardando_aprovacao_corretor',
        'ajustes_solicitados',
        'aprovado',
        'publicado',
      ].includes(status)
        ? 'confirmado'
        : current.paymentStatus,
  }
  return upsertProfessionalRequest(updated)
}

export function createDraftRequest(realtorId: number, realtorName: string): ProfessionalRequest {
  const existing = getRealtorProfessionalRequest(realtorId)
  if (existing && existing.status !== 'cancelado' && existing.status !== 'nao_contratado') {
    return existing
  }
  const request: ProfessionalRequest = {
    id: `pp-req-${Date.now()}`,
    realtorId,
    realtorName,
    status: 'solicitacao_iniciada',
    price: PROFESSIONAL_PAGE_PRICE,
    createdAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    producer: 'A definir',
    form: emptyForm(realtorId),
    materials: [],
    timeline: [
      {
        id: 't-new',
        status: 'solicitacao_iniciada',
        label: 'Solicitação iniciada',
        at: new Date().toLocaleString('pt-BR'),
      },
    ],
    checklist: defaultChecklist().map((c) => ({ ...c, done: false })),
    messages: [],
    adjustments: [],
    paymentStatus: 'nao_iniciado',
  }
  return upsertProfessionalRequest(request)
}

export function getScopedRequests(): ProfessionalRequest[] {
  return filterByRealtor(loadProfessionalRequests())
}

export function timelineProgress(status: ProfessionalRequestStatus): number {
  const order: ProfessionalRequestStatus[] = [
    'solicitacao_iniciada',
    'aguardando_informacoes',
    'aguardando_materiais',
    'aguardando_pagamento',
    'pagamento_confirmado',
    'em_producao',
    'em_revisao_interna',
    'aguardando_aprovacao_corretor',
    'ajustes_solicitados',
    'aprovado',
    'publicado',
  ]
  if (status === 'nao_contratado') return 0
  if (status === 'cancelado' || status === 'suspenso') return 100
  const idx = order.indexOf(status)
  if (idx < 0) return 10
  return Math.round(((idx + 1) / order.length) * 100)
}

export { formatCurrency, getCurrentRealtorId }
