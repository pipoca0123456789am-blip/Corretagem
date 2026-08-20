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

export const clientsOptions = [
  { value: 'Ana Paula Mendes', label: 'Ana Paula Mendes' },
  { value: 'Bruno Henrique Costa', label: 'Bruno Henrique Costa' },
  { value: 'Fernanda Oliveira Rocha', label: 'Fernanda Oliveira Rocha' },
  { value: 'Lucas Martins Souza', label: 'Lucas Martins Souza' },
  { value: 'Patrícia Almeida Nunes', label: 'Patrícia Almeida Nunes' },
  { value: 'Ricardo Teixeira Pinto', label: 'Ricardo Teixeira Pinto' },
]

export const propertyOptions = [
  { value: '1', label: 'Apartamento Luxo Vila Mariana' },
  { value: '2', label: 'Casa Moderna em Condomínio' },
  { value: '3', label: 'Comercial Centro São Paulo' },
  { value: '4', label: 'Apartamento Compacto Zona Leste' },
  { value: '5', label: 'Sala Comercial Av. Paulista' },
]

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    title: 'Visita — Apartamento Vila Mariana',
    type: 'visita',
    status: 'confirmado',
    date: '2026-07-28',
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    location: 'Portaria do condomínio — Rua Domingos de Morais, 1200',
    notes: 'Cliente pediu para ver a varanda gourmet e as vagas.',
    reminder: true,
    reminderMinutes: 60,
    clientName: 'Ana Paula Mendes',
    propertyTitle: 'Apartamento Luxo Vila Mariana',
    propertyId: 1,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    visitStatus: 'confirmada',
    confirmed: true,
    createdAt: '2026-07-20T09:00:00',
    updatedAt: '2026-07-25T14:20:00',
  },
  {
    id: 'apt-2',
    title: 'Ligação — Follow-up proposta',
    type: 'ligacao',
    status: 'agendado',
    date: '2026-07-28',
    startTime: '14:30',
    endTime: '14:45',
    durationMinutes: 15,
    notes: 'Confirmar interesse após visita de sábado.',
    reminder: true,
    reminderMinutes: 15,
    clientName: 'Bruno Henrique Costa',
    propertyTitle: 'Casa Moderna em Condomínio',
    propertyId: 2,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    confirmed: false,
    createdAt: '2026-07-27T11:00:00',
    updatedAt: '2026-07-27T11:00:00',
  },
  {
    id: 'apt-3',
    title: 'Reunião com proprietário',
    type: 'reuniao',
    status: 'confirmado',
    date: '2026-07-29',
    startTime: '09:30',
    endTime: '10:30',
    durationMinutes: 60,
    location: 'Café Jardim — Rua Augusta, 450',
    notes: 'Apresentar contraproposta de R$ 1.180.000.',
    reminder: true,
    reminderMinutes: 30,
    clientName: 'João Silva',
    propertyTitle: 'Apartamento Luxo Vila Mariana',
    propertyId: 1,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    confirmed: true,
    createdAt: '2026-07-22T16:00:00',
    updatedAt: '2026-07-26T10:00:00',
  },
  {
    id: 'apt-4',
    title: 'Visita — Casa Alphaville',
    type: 'visita',
    status: 'agendado',
    date: '2026-07-30',
    startTime: '16:00',
    endTime: '17:30',
    durationMinutes: 90,
    location: 'Entrada do condomínio — portaria 2',
    notes: 'Levar chave reserva. Cliente virá com a esposa.',
    reminder: true,
    reminderMinutes: 120,
    clientName: 'Fernanda Oliveira Rocha',
    propertyTitle: 'Casa Moderna em Condomínio',
    propertyId: 2,
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    visitStatus: 'aguardando_confirmacao',
    confirmed: false,
    createdAt: '2026-07-24T08:30:00',
    updatedAt: '2026-07-24T08:30:00',
  },
  {
    id: 'apt-5',
    title: 'Tarefa — Enviar documentação',
    type: 'tarefa',
    status: 'agendado',
    date: '2026-07-28',
    startTime: '11:30',
    endTime: '12:00',
    durationMinutes: 30,
    notes: 'Enviar RG, CPF e comprovante de renda do comprador.',
    reminder: true,
    reminderMinutes: 30,
    clientName: 'Lucas Martins Souza',
    propertyTitle: 'Apartamento Compacto Zona Leste',
    propertyId: 4,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    confirmed: false,
    createdAt: '2026-07-26T09:00:00',
    updatedAt: '2026-07-26T09:00:00',
  },
  {
    id: 'apt-6',
    title: 'Follow-up pós-visita',
    type: 'follow_up',
    status: 'reagendado',
    date: '2026-07-31',
    startTime: '11:00',
    endTime: '11:20',
    durationMinutes: 20,
    notes: 'Cliente pediu 48h para decidir. Reagendado do dia 29.',
    reminder: true,
    reminderMinutes: 60,
    clientName: 'Patrícia Almeida Nunes',
    propertyTitle: 'Sala Comercial Av. Paulista',
    propertyId: 5,
    realtorId: 4,
    realtorName: 'Juliana Lima Oliveira',
    confirmed: true,
    createdAt: '2026-07-21T15:00:00',
    updatedAt: '2026-07-27T18:00:00',
  },
  {
    id: 'apt-7',
    title: 'Consulta médica',
    type: 'pessoal',
    status: 'confirmado',
    date: '2026-07-29',
    startTime: '15:00',
    endTime: '16:00',
    durationMinutes: 60,
    location: 'Clínica São Lucas',
    notes: 'Bloquear agenda — evento pessoal.',
    reminder: true,
    reminderMinutes: 60,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    confirmed: true,
    createdAt: '2026-07-10T10:00:00',
    updatedAt: '2026-07-10T10:00:00',
  },
  {
    id: 'apt-8',
    title: 'Lembrete — Renovar anúncio',
    type: 'lembrete',
    status: 'agendado',
    date: '2026-08-01',
    startTime: '09:00',
    endTime: '09:15',
    durationMinutes: 15,
    notes: 'Atualizar fotos e preço do comercial no Centro.',
    reminder: true,
    reminderMinutes: 0,
    propertyTitle: 'Comercial Centro São Paulo',
    propertyId: 3,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    confirmed: false,
    createdAt: '2026-07-25T12:00:00',
    updatedAt: '2026-07-25T12:00:00',
  },
  {
    id: 'apt-9',
    title: 'Visita — Compacto Zona Leste',
    type: 'visita',
    status: 'concluido',
    date: '2026-07-25',
    startTime: '10:00',
    endTime: '10:45',
    durationMinutes: 45,
    location: 'Hall do prédio',
    notes: 'Cliente gostou. Pediu simulação de financiamento.',
    reminder: false,
    reminderMinutes: 60,
    clientName: 'Lucas Martins Souza',
    propertyTitle: 'Apartamento Compacto Zona Leste',
    propertyId: 4,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    visitStatus: 'realizada',
    confirmed: true,
    createdAt: '2026-07-18T09:00:00',
    updatedAt: '2026-07-25T11:00:00',
  },
  {
    id: 'apt-10',
    title: 'Visita cancelada — Paulista',
    type: 'visita',
    status: 'cancelado',
    date: '2026-07-27',
    startTime: '17:00',
    endTime: '18:00',
    durationMinutes: 60,
    location: 'Recepção do edifício',
    notes: 'Cliente desmarcou por conflito de agenda.',
    reminder: false,
    reminderMinutes: 60,
    clientName: 'Ricardo Teixeira Pinto',
    propertyTitle: 'Sala Comercial Av. Paulista',
    propertyId: 5,
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    visitStatus: 'cancelada',
    confirmed: false,
    createdAt: '2026-07-20T14:00:00',
    updatedAt: '2026-07-27T09:30:00',
  },
  {
    id: 'apt-11',
    title: 'Visita — Cliente não compareceu',
    type: 'visita',
    status: 'concluido',
    date: '2026-07-26',
    startTime: '15:00',
    endTime: '16:00',
    durationMinutes: 60,
    location: 'Portaria',
    notes: 'Aguardei 20 minutos. Reagendar contato.',
    reminder: true,
    reminderMinutes: 60,
    clientName: 'Bruno Henrique Costa',
    propertyTitle: 'Apartamento Luxo Vila Mariana',
    propertyId: 1,
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    visitStatus: 'cliente_nao_compareceu',
    confirmed: true,
    createdAt: '2026-07-19T10:00:00',
    updatedAt: '2026-07-26T16:10:00',
  },
  {
    id: 'apt-12',
    title: 'Reunião de alinhamento semanal',
    type: 'reuniao',
    status: 'agendado',
    date: '2026-08-03',
    startTime: '08:30',
    endTime: '09:30',
    durationMinutes: 60,
    location: 'Escritório ImóvelHub — Sala 3',
    notes: 'Revisar pipeline de julho e metas de agosto.',
    reminder: true,
    reminderMinutes: 30,
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    confirmed: false,
    createdAt: '2026-07-28T08:00:00',
    updatedAt: '2026-07-28T08:00:00',
  },
]

export const initialNegotiations: Negotiation[] = [
  {
    id: 'neg-1',
    code: 'NEG-2026-0142',
    clientName: 'Ana Paula Mendes',
    clientEmail: 'ana.mendes@email.com',
    clientPhone: '(11) 98765-1122',
    propertyId: 1,
    propertyTitle: 'Apartamento Luxo Vila Mariana',
    propertyAddress: 'Vila Mariana, São Paulo - SP',
    ownerName: 'João Silva',
    ownerEmail: 'joao@email.com',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    requestedValue: 1250000,
    offeredValue: 1180000,
    downPayment: 350000,
    financing: 830000,
    conditions: 'Financiamento bancário + FGTS. Prazo de desocupação de 30 dias.',
    deadline: '2026-08-15',
    commissionPercent: 5,
    commissionValue: 59000,
    status: 'em_negociacao',
    observations: 'Proprietário sinalizou abertura para valores próximos de R$ 1.200.000.',
    documents: [
      { id: 'd1', name: 'RG e CPF do comprador', status: 'aprovado', required: true },
      { id: 'd2', name: 'Comprovante de renda', status: 'enviado', required: true, dueDate: '2026-08-01' },
      { id: 'd3', name: 'Matrícula atualizada do imóvel', status: 'pendente', required: true, dueDate: '2026-08-05' },
      { id: 'd4', name: 'Certidão de ônus reais', status: 'pendente', required: true, dueDate: '2026-08-05' },
      { id: 'd5', name: 'Procuração (se aplicável)', status: 'pendente', required: false },
    ],
    timeline: [
      {
        id: 't1',
        date: '2026-07-18',
        time: '10:15',
        title: 'Proposta em preparação',
        description: 'Corretor iniciou a montagem da proposta comercial.',
        actor: 'Carlos Eduardo Silva',
        type: 'status',
      },
      {
        id: 't2',
        date: '2026-07-20',
        time: '16:40',
        title: 'Proposta enviada',
        description: 'Oferta de R$ 1.180.000 enviada ao proprietário.',
        actor: 'Carlos Eduardo Silva',
        type: 'proposta',
      },
      {
        id: 't3',
        date: '2026-07-22',
        time: '11:05',
        title: 'Aguardando proprietário',
        description: 'Proprietário recebeu e pediu 48h para analisar.',
        actor: 'João Silva',
        type: 'status',
      },
      {
        id: 't4',
        date: '2026-07-24',
        time: '09:20',
        title: 'Contraproposta',
        description: 'Proprietário sugeriu R$ 1.220.000 com prazo de 20 dias.',
        actor: 'João Silva',
        type: 'contraproposta',
      },
      {
        id: 't5',
        date: '2026-07-26',
        time: '15:50',
        title: 'Em negociação',
        description: 'Cliente autorizou nova oferta intermediária de R$ 1.200.000.',
        actor: 'Ana Paula Mendes',
        type: 'observacao',
      },
    ],
    checklist: [
      { id: 'c1', label: 'Proposta aceita por ambas as partes', done: false, required: true },
      { id: 'c2', label: 'Documentação do comprador completa', done: false, required: true },
      { id: 'c3', label: 'Documentação do imóvel completa', done: false, required: true },
      { id: 'c4', label: 'Contrato revisado pelo jurídico', done: false, required: true },
      { id: 'c5', label: 'Assinaturas coletadas', done: false, required: true },
      { id: 'c6', label: 'Comissão registrada', done: false, required: true },
      { id: 'c7', label: 'Chaves e inventário combinados', done: false, required: false },
    ],
    contractReady: false,
    signatureStatus: 'nao_iniciada',
    createdAt: '2026-07-18T10:15:00',
    updatedAt: '2026-07-26T15:50:00',
  },
  {
    id: 'neg-2',
    code: 'NEG-2026-0158',
    clientName: 'Lucas Martins Souza',
    clientEmail: 'lucas.martins@email.com',
    clientPhone: '(11) 97654-3344',
    propertyId: 4,
    propertyTitle: 'Apartamento Compacto Zona Leste',
    propertyAddress: 'Vila Prudente, São Paulo - SP',
    ownerName: 'Ana Costa',
    ownerEmail: 'ana@email.com',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    requestedValue: 350000,
    offeredValue: 335000,
    downPayment: 70000,
    financing: 265000,
    conditions: 'Uso de FGTS + financiamento Caixa. Entrega das chaves em até 15 dias.',
    deadline: '2026-08-10',
    commissionPercent: 6,
    commissionValue: 20100,
    status: 'documentacao',
    observations: 'Cliente aprovado no crédito prévio. Aguardando matrícula.',
    documents: [
      { id: 'd1', name: 'RG e CPF do comprador', status: 'aprovado', required: true },
      { id: 'd2', name: 'Comprovante de renda', status: 'aprovado', required: true },
      { id: 'd3', name: 'Extrato FGTS', status: 'enviado', required: true, dueDate: '2026-08-02' },
      { id: 'd4', name: 'Matrícula atualizada do imóvel', status: 'pendente', required: true, dueDate: '2026-08-03' },
      { id: 'd5', name: 'Certidão negativa de débitos', status: 'pendente', required: true, dueDate: '2026-08-03' },
    ],
    timeline: [
      {
        id: 't1',
        date: '2026-07-15',
        time: '14:00',
        title: 'Proposta enviada',
        description: 'Oferta inicial de R$ 330.000.',
        actor: 'Carlos Eduardo Silva',
        type: 'proposta',
      },
      {
        id: 't2',
        date: '2026-07-17',
        time: '10:30',
        title: 'Contraproposta',
        description: 'Proprietária pediu R$ 340.000.',
        actor: 'Ana Costa',
        type: 'contraproposta',
      },
      {
        id: 't3',
        date: '2026-07-19',
        time: '17:15',
        title: 'Proposta aprovada',
        description: 'Acordo em R$ 335.000. Início da documentação.',
        actor: 'Ana Costa',
        type: 'aprovacao',
      },
      {
        id: 't4',
        date: '2026-07-21',
        time: '09:00',
        title: 'Documentação',
        description: 'Checklist documental aberto para as partes.',
        actor: 'Sistema',
        type: 'documento',
      },
    ],
    checklist: [
      { id: 'c1', label: 'Proposta aceita por ambas as partes', done: true, required: true },
      { id: 'c2', label: 'Documentação do comprador completa', done: false, required: true },
      { id: 'c3', label: 'Documentação do imóvel completa', done: false, required: true },
      { id: 'c4', label: 'Contrato revisado pelo jurídico', done: false, required: true },
      { id: 'c5', label: 'Assinaturas coletadas', done: false, required: true },
      { id: 'c6', label: 'Comissão registrada', done: false, required: true },
      { id: 'c7', label: 'Chaves e inventário combinados', done: false, required: false },
    ],
    contractReady: true,
    signatureStatus: 'nao_iniciada',
    createdAt: '2026-07-15T14:00:00',
    updatedAt: '2026-07-21T09:00:00',
  },
  {
    id: 'neg-3',
    code: 'NEG-2026-0163',
    clientName: 'Fernanda Oliveira Rocha',
    clientEmail: 'fernanda.rocha@email.com',
    clientPhone: '(11) 96543-7788',
    propertyId: 2,
    propertyTitle: 'Casa Moderna em Condomínio',
    propertyAddress: 'Alphaville, São Paulo - SP',
    ownerName: 'Maria Santos',
    ownerEmail: 'maria@email.com',
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    requestedValue: 850000,
    offeredValue: 820000,
    downPayment: 250000,
    financing: 570000,
    conditions: 'Pagamento misto. Inclusão de móveis planejados da cozinha.',
    deadline: '2026-08-20',
    commissionPercent: 5,
    commissionValue: 41000,
    status: 'proposta_enviada',
    observations: 'Aguardando retorno da proprietária após visita de 30/07.',
    documents: [
      { id: 'd1', name: 'RG e CPF do comprador', status: 'pendente', required: true },
      { id: 'd2', name: 'Comprovante de renda', status: 'pendente', required: true },
      { id: 'd3', name: 'Matrícula atualizada do imóvel', status: 'pendente', required: true },
    ],
    timeline: [
      {
        id: 't1',
        date: '2026-07-27',
        time: '18:00',
        title: 'Proposta em preparação',
        description: 'Cliente solicitou formalização após visita virtual.',
        actor: 'Marina Costa Santos',
        type: 'status',
      },
      {
        id: 't2',
        date: '2026-07-28',
        time: '10:10',
        title: 'Proposta enviada',
        description: 'Oferta de R$ 820.000 enviada à proprietária.',
        actor: 'Marina Costa Santos',
        type: 'proposta',
      },
    ],
    checklist: [
      { id: 'c1', label: 'Proposta aceita por ambas as partes', done: false, required: true },
      { id: 'c2', label: 'Documentação do comprador completa', done: false, required: true },
      { id: 'c3', label: 'Documentação do imóvel completa', done: false, required: true },
      { id: 'c4', label: 'Contrato revisado pelo jurídico', done: false, required: true },
      { id: 'c5', label: 'Assinaturas coletadas', done: false, required: true },
      { id: 'c6', label: 'Comissão registrada', done: false, required: true },
      { id: 'c7', label: 'Chaves e inventário combinados', done: false, required: false },
    ],
    contractReady: false,
    signatureStatus: 'nao_iniciada',
    createdAt: '2026-07-27T18:00:00',
    updatedAt: '2026-07-28T10:10:00',
  },
  {
    id: 'neg-4',
    code: 'NEG-2026-0130',
    clientName: 'Patrícia Almeida Nunes',
    clientEmail: 'patricia.nunes@email.com',
    clientPhone: '(11) 95432-5566',
    propertyId: 5,
    propertyTitle: 'Sala Comercial Av. Paulista',
    propertyAddress: 'Avenida Paulista, São Paulo - SP',
    ownerName: 'Gestora Imobiliária',
    ownerEmail: 'gestora@email.com',
    realtorId: 4,
    realtorName: 'Juliana Lima Oliveira',
    requestedValue: 450000,
    offeredValue: 430000,
    downPayment: 430000,
    financing: 0,
    conditions: 'Pagamento à vista com desconto. Escritura em cartório até 20/08.',
    deadline: '2026-08-20',
    commissionPercent: 4,
    commissionValue: 17200,
    status: 'fechada',
    observations: 'Negociação concluída. Comissão a liberar na próxima quinzena.',
    documents: [
      { id: 'd1', name: 'RG e CPF do comprador', status: 'aprovado', required: true },
      { id: 'd2', name: 'Comprovante de pagamento', status: 'aprovado', required: true },
      { id: 'd3', name: 'Contrato assinado', status: 'aprovado', required: true },
      { id: 'd4', name: 'Guia de ITBI', status: 'aprovado', required: true },
    ],
    timeline: [
      {
        id: 't1',
        date: '2026-06-28',
        time: '11:00',
        title: 'Proposta enviada',
        description: 'Oferta à vista de R$ 430.000.',
        actor: 'Juliana Lima Oliveira',
        type: 'proposta',
      },
      {
        id: 't2',
        date: '2026-07-02',
        time: '16:00',
        title: 'Aprovada',
        description: 'Proprietária aceitou a proposta.',
        actor: 'Gestora Imobiliária',
        type: 'aprovacao',
      },
      {
        id: 't3',
        date: '2026-07-10',
        time: '14:00',
        title: 'Documentação',
        description: 'Todos os documentos foram validados.',
        actor: 'Sistema',
        type: 'documento',
      },
      {
        id: 't4',
        date: '2026-07-18',
        time: '10:00',
        title: 'Assinatura concluída',
        description: 'Contrato assinado pelas partes (simulado).',
        actor: 'Sistema',
        type: 'sistema',
      },
      {
        id: 't5',
        date: '2026-07-18',
        time: '10:30',
        title: 'Negociação fechada',
        description: 'Checklist de fechamento 100% concluído.',
        actor: 'Juliana Lima Oliveira',
        type: 'status',
      },
    ],
    checklist: [
      { id: 'c1', label: 'Proposta aceita por ambas as partes', done: true, required: true },
      { id: 'c2', label: 'Documentação do comprador completa', done: true, required: true },
      { id: 'c3', label: 'Documentação do imóvel completa', done: true, required: true },
      { id: 'c4', label: 'Contrato revisado pelo jurídico', done: true, required: true },
      { id: 'c5', label: 'Assinaturas coletadas', done: true, required: true },
      { id: 'c6', label: 'Comissão registrada', done: true, required: true },
      { id: 'c7', label: 'Chaves e inventário combinados', done: true, required: false },
    ],
    contractReady: true,
    signatureStatus: 'assinada',
    createdAt: '2026-06-28T11:00:00',
    updatedAt: '2026-07-18T10:30:00',
  },
  {
    id: 'neg-5',
    code: 'NEG-2026-0149',
    clientName: 'Ricardo Teixeira Pinto',
    clientEmail: 'ricardo.pinto@email.com',
    clientPhone: '(11) 94321-8899',
    propertyId: 3,
    propertyTitle: 'Comercial Centro São Paulo',
    propertyAddress: 'Centro, São Paulo - SP',
    ownerName: 'Empresa XYZ',
    ownerEmail: 'contato@xyz.com',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    requestedValue: 2500000,
    offeredValue: 2300000,
    downPayment: 500000,
    financing: 1800000,
    conditions: 'Proposta condicionada a laudo estrutural.',
    deadline: '2026-07-30',
    commissionPercent: 4,
    commissionValue: 92000,
    status: 'recusada',
    observations: 'Proprietário recusou valores abaixo de R$ 2.450.000.',
    documents: [
      { id: 'd1', name: 'RG e CPF do comprador', status: 'enviado', required: true },
      { id: 'd2', name: 'Carta de intenção', status: 'enviado', required: true },
    ],
    timeline: [
      {
        id: 't1',
        date: '2026-07-10',
        time: '09:00',
        title: 'Proposta enviada',
        description: 'Oferta de R$ 2.300.000 com laudo.',
        actor: 'Carlos Eduardo Silva',
        type: 'proposta',
      },
      {
        id: 't2',
        date: '2026-07-12',
        time: '15:40',
        title: 'Proposta recusada',
        description: 'Proprietário rejeitou a oferta e encerrou a tratativa.',
        actor: 'Empresa XYZ',
        type: 'status',
      },
    ],
    checklist: [
      { id: 'c1', label: 'Proposta aceita por ambas as partes', done: false, required: true },
      { id: 'c2', label: 'Documentação do comprador completa', done: false, required: true },
      { id: 'c3', label: 'Documentação do imóvel completa', done: false, required: true },
      { id: 'c4', label: 'Contrato revisado pelo jurídico', done: false, required: true },
      { id: 'c5', label: 'Assinaturas coletadas', done: false, required: true },
      { id: 'c6', label: 'Comissão registrada', done: false, required: true },
      { id: 'c7', label: 'Chaves e inventário combinados', done: false, required: false },
    ],
    contractReady: false,
    signatureStatus: 'recusada',
    createdAt: '2026-07-10T09:00:00',
    updatedAt: '2026-07-12T15:40:00',
  },
]

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
