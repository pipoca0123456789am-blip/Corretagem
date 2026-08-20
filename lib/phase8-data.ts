import { filterByRealtor, formatCurrency, formatDateBR } from '@/lib/phase7-data'

export type CommissionStatus =
  | 'calculada'
  | 'aguardando_fechamento'
  | 'aprovada'
  | 'aguardando_pagamento'
  | 'parcialmente_paga'
  | 'paga'
  | 'cancelada'

export type DealType = 'venda' | 'locacao'
export type EntryType = 'receita' | 'despesa' | 'comissao'
export type AttachmentKind = 'comprovante' | 'nota' | 'contrato' | 'outro'

export interface FinancialAttachment {
  id: string
  name: string
  kind: AttachmentKind
  uploadedAt: string
}

export interface CommissionHistoryEvent {
  id: string
  date: string
  title: string
  description: string
}

export interface Commission {
  id: string
  code: string
  propertyTitle: string
  propertyAddress: string
  clientName: string
  negotiationCode: string
  dealType: DealType
  dealValue: number
  percent: number
  commissionValue: number
  splitPercent: number
  splitPartner?: string
  expectedDate: string
  receivedDate?: string
  paidAmount: number
  status: CommissionStatus
  observations: string
  realtorId: number
  realtorName: string
  attachments: FinancialAttachment[]
  history: CommissionHistoryEvent[]
  createdAt: string
  updatedAt: string
}

export interface Revenue {
  id: string
  title: string
  category: string
  amount: number
  date: string
  source: string
  commissionId?: string
  realtorId: number
  realtorName: string
  notes?: string
  attachments: FinancialAttachment[]
}

export interface Expense {
  id: string
  title: string
  category: string
  amount: number
  date: string
  paymentMethod: string
  realtorId: number
  realtorName: string
  notes?: string
  attachments: FinancialAttachment[]
  recurring: boolean
}

export interface LedgerEntry {
  id: string
  date: string
  description: string
  type: EntryType
  category: string
  amount: number
  balanceAfter: number
  realtorId: number
  realtorName: string
  referenceId?: string
}

export interface ContractedService {
  id: string
  name: string
  type: 'assinatura' | 'pagina_profissional' | 'ia' | 'usuarios' | 'dominio' | 'outro'
  plan: string
  monthlyValue: number
  status: 'ativo' | 'pendente' | 'cancelado' | 'trial'
  nextPayment: string
  realtorId: number
  realtorName: string
  description: string
}

export interface UpcomingPayment {
  id: string
  title: string
  amount: number
  dueDate: string
  type: 'servico' | 'despesa' | 'comissao_parceiro'
  realtorId: number
  realtorName: string
}

export const commissionStatusLabels: Record<CommissionStatus, string> = {
  calculada: 'Comissão calculada',
  aguardando_fechamento: 'Aguardando fechamento',
  aprovada: 'Aprovada',
  aguardando_pagamento: 'Aguardando pagamento',
  parcialmente_paga: 'Parcialmente paga',
  paga: 'Paga',
  cancelada: 'Cancelada',
}

export const commissionStatusBadge = (
  status: CommissionStatus
): 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' => {
  const map: Record<CommissionStatus, 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'> = {
    calculada: 'default',
    aguardando_fechamento: 'warning',
    aprovada: 'info',
    aguardando_pagamento: 'warning',
    parcialmente_paga: 'primary',
    paga: 'success',
    cancelada: 'destructive',
  }
  return map[status]
}

export const revenueCategories = [
  'Comissão de venda',
  'Comissão de locação',
  'Bonificação',
  'Indicação',
  'Outros',
]

export const expenseCategories = [
  'Marketing',
  'Transporte',
  'Escritório',
  'Ferramentas',
  'Assinaturas',
  'Impostos',
  'Outros',
]

export const monthlyEvolution = [
  { month: 'Fev', receita: 18400, despesa: 4200, comissao: 16200 },
  { month: 'Mar', receita: 22100, despesa: 5100, comissao: 19800 },
  { month: 'Abr', receita: 19850, despesa: 4800, comissao: 17500 },
  { month: 'Mai', receita: 25600, despesa: 5600, comissao: 23200 },
  { month: 'Jun', receita: 24350, despesa: 5300, comissao: 21900 },
  { month: 'Jul', receita: 27840, despesa: 6120, comissao: 25100 },
]

export const initialCommissions: Commission[] = [
  {
    id: 'com-1',
    code: 'COM-2026-0088',
    propertyTitle: 'Sala Comercial Av. Paulista',
    propertyAddress: 'Avenida Paulista, São Paulo - SP',
    clientName: 'Patrícia Almeida Nunes',
    negotiationCode: 'NEG-2026-0130',
    dealType: 'venda',
    dealValue: 430000,
    percent: 4,
    commissionValue: 17200,
    splitPercent: 100,
    expectedDate: '2026-07-25',
    receivedDate: '2026-07-22',
    paidAmount: 17200,
    status: 'paga',
    observations: 'Comissão integral liberada após registro da escritura.',
    realtorId: 4,
    realtorName: 'Juliana Lima Oliveira',
    attachments: [
      { id: 'a1', name: 'comprovante-pagamento-0722.pdf', kind: 'comprovante', uploadedAt: '2026-07-22' },
    ],
    history: [
      { id: 'h1', date: '2026-07-18', title: 'Calculada', description: '4% sobre R$ 430.000.' },
      { id: 'h2', date: '2026-07-19', title: 'Aprovada', description: 'Financeiro validou o fechamento.' },
      { id: 'h3', date: '2026-07-22', title: 'Paga', description: 'Transferência PIX recebida.' },
    ],
    createdAt: '2026-07-18T10:30:00',
    updatedAt: '2026-07-22T14:00:00',
  },
  {
    id: 'com-2',
    code: 'COM-2026-0094',
    propertyTitle: 'Apartamento Compacto Zona Leste',
    propertyAddress: 'Vila Prudente, São Paulo - SP',
    clientName: 'Lucas Martins Souza',
    negotiationCode: 'NEG-2026-0158',
    dealType: 'venda',
    dealValue: 335000,
    percent: 6,
    commissionValue: 20100,
    splitPercent: 80,
    splitPartner: 'Imobiliária Parceira Centro',
    expectedDate: '2026-08-05',
    paidAmount: 0,
    status: 'aguardando_pagamento',
    observations: 'Aguardando liberação do cartório. Split 80/20 com parceiro.',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [
      { id: 'a1', name: 'minuta-comissao.pdf', kind: 'contrato', uploadedAt: '2026-07-21' },
    ],
    history: [
      { id: 'h1', date: '2026-07-19', title: 'Calculada', description: '6% sobre R$ 335.000.' },
      { id: 'h2', date: '2026-07-21', title: 'Aguardando fechamento', description: 'Documentação em andamento.' },
      { id: 'h3', date: '2026-07-26', title: 'Aprovada', description: 'Aprovada pelo gestor regional.' },
      { id: 'h4', date: '2026-07-27', title: 'Aguardando pagamento', description: 'Na fila de pagamento de agosto.' },
    ],
    createdAt: '2026-07-19T09:00:00',
    updatedAt: '2026-07-27T11:00:00',
  },
  {
    id: 'com-3',
    code: 'COM-2026-0097',
    propertyTitle: 'Apartamento Luxo Vila Mariana',
    propertyAddress: 'Vila Mariana, São Paulo - SP',
    clientName: 'Ana Paula Mendes',
    negotiationCode: 'NEG-2026-0142',
    dealType: 'venda',
    dealValue: 1200000,
    percent: 5,
    commissionValue: 60000,
    splitPercent: 100,
    expectedDate: '2026-08-20',
    paidAmount: 0,
    status: 'aguardando_fechamento',
    observations: 'Negociação ainda em andamento. Valor estimado.',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
    history: [
      { id: 'h1', date: '2026-07-26', title: 'Calculada', description: 'Estimativa com base na oferta intermediária.' },
      { id: 'h2', date: '2026-07-26', title: 'Aguardando fechamento', description: 'Aguardando aceite final das partes.' },
    ],
    createdAt: '2026-07-26T16:00:00',
    updatedAt: '2026-07-26T16:00:00',
  },
  {
    id: 'com-4',
    code: 'COM-2026-0081',
    propertyTitle: 'Apartamento Compacto Zona Leste',
    propertyAddress: 'Vila Prudente, São Paulo - SP',
    clientName: 'Família Andrade',
    negotiationCode: 'NEG-2026-0112',
    dealType: 'locacao',
    dealValue: 2800,
    percent: 100,
    commissionValue: 2800,
    splitPercent: 100,
    expectedDate: '2026-07-10',
    receivedDate: '2026-07-08',
    paidAmount: 2800,
    status: 'paga',
    observations: 'Primeiro aluguel + taxa de intermediação.',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [
      { id: 'a1', name: 'recibo-locacao-jul.pdf', kind: 'comprovante', uploadedAt: '2026-07-08' },
    ],
    history: [
      { id: 'h1', date: '2026-07-05', title: 'Calculada', description: 'Equivalente a 1 aluguel.' },
      { id: 'h2', date: '2026-07-08', title: 'Paga', description: 'Recebido via TED.' },
    ],
    createdAt: '2026-07-05T10:00:00',
    updatedAt: '2026-07-08T17:00:00',
  },
  {
    id: 'com-5',
    code: 'COM-2026-0091',
    propertyTitle: 'Casa Moderna em Condomínio',
    propertyAddress: 'Alphaville, São Paulo - SP',
    clientName: 'Fernanda Oliveira Rocha',
    negotiationCode: 'NEG-2026-0163',
    dealType: 'venda',
    dealValue: 820000,
    percent: 5,
    commissionValue: 41000,
    splitPercent: 70,
    splitPartner: 'Equipe Alphaville',
    expectedDate: '2026-08-25',
    paidAmount: 14350,
    status: 'parcialmente_paga',
    observations: 'Adiantamento de 35% liberado. Saldo após escritura.',
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    attachments: [
      { id: 'a1', name: 'adiantamento-parcial.pdf', kind: 'comprovante', uploadedAt: '2026-07-20' },
    ],
    history: [
      { id: 'h1', date: '2026-07-15', title: 'Calculada', description: '5% sobre R$ 820.000.' },
      { id: 'h2', date: '2026-07-18', title: 'Aprovada', description: 'Aprovada com split 70/30.' },
      { id: 'h3', date: '2026-07-20', title: 'Parcialmente paga', description: 'Adiantamento de R$ 14.350.' },
    ],
    createdAt: '2026-07-15T12:00:00',
    updatedAt: '2026-07-20T09:30:00',
  },
  {
    id: 'com-6',
    code: 'COM-2026-0075',
    propertyTitle: 'Comercial Centro São Paulo',
    propertyAddress: 'Centro, São Paulo - SP',
    clientName: 'Ricardo Teixeira Pinto',
    negotiationCode: 'NEG-2026-0149',
    dealType: 'venda',
    dealValue: 2300000,
    percent: 4,
    commissionValue: 92000,
    splitPercent: 100,
    expectedDate: '2026-07-30',
    paidAmount: 0,
    status: 'cancelada',
    observations: 'Negociação recusada pelo proprietário.',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
    history: [
      { id: 'h1', date: '2026-07-10', title: 'Calculada', description: 'Estimativa inicial.' },
      { id: 'h2', date: '2026-07-12', title: 'Cancelada', description: 'Proposta recusada.' },
    ],
    createdAt: '2026-07-10T09:00:00',
    updatedAt: '2026-07-12T15:40:00',
  },
  {
    id: 'com-7',
    code: 'COM-2026-0101',
    propertyTitle: 'Cobertura Moema',
    propertyAddress: 'Moema, São Paulo - SP',
    clientName: 'Bruno Henrique Costa',
    negotiationCode: 'NEG-2026-0170',
    dealType: 'venda',
    dealValue: 980000,
    percent: 5,
    commissionValue: 49000,
    splitPercent: 100,
    expectedDate: '2026-08-12',
    paidAmount: 0,
    status: 'aprovada',
    observations: 'Aguardando agenda de pagamento da imobiliária.',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [
      { id: 'a1', name: 'aprovacao-comissao.pdf', kind: 'nota', uploadedAt: '2026-07-28' },
    ],
    history: [
      { id: 'h1', date: '2026-07-24', title: 'Calculada', description: '5% sobre R$ 980.000.' },
      { id: 'h2', date: '2026-07-28', title: 'Aprovada', description: 'Aprovada pelo financeiro.' },
    ],
    createdAt: '2026-07-24T11:00:00',
    updatedAt: '2026-07-28T08:00:00',
  },
]

export const initialRevenues: Revenue[] = [
  {
    id: 'rev-1',
    title: 'Comissão locação — Família Andrade',
    category: 'Comissão de locação',
    amount: 2800,
    date: '2026-07-08',
    source: 'COM-2026-0081',
    commissionId: 'com-4',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    notes: 'Recebido via TED',
    attachments: [{ id: 'a1', name: 'recibo-locacao-jul.pdf', kind: 'comprovante', uploadedAt: '2026-07-08' }],
  },
  {
    id: 'rev-2',
    title: 'Bonificação meta trimestral',
    category: 'Bonificação',
    amount: 1500,
    date: '2026-07-15',
    source: 'Programa de metas',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
  },
  {
    id: 'rev-3',
    title: 'Indicação de cliente — Marina',
    category: 'Indicação',
    amount: 800,
    date: '2026-07-18',
    source: 'Programa indicação',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
  },
  {
    id: 'rev-4',
    title: 'Comissão venda — Paulista',
    category: 'Comissão de venda',
    amount: 17200,
    date: '2026-07-22',
    source: 'COM-2026-0088',
    commissionId: 'com-1',
    realtorId: 4,
    realtorName: 'Juliana Lima Oliveira',
    attachments: [{ id: 'a1', name: 'comprovante-pagamento-0722.pdf', kind: 'comprovante', uploadedAt: '2026-07-22' }],
  },
  {
    id: 'rev-5',
    title: 'Adiantamento comissão Alphaville',
    category: 'Comissão de venda',
    amount: 14350,
    date: '2026-07-20',
    source: 'COM-2026-0091',
    commissionId: 'com-5',
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    attachments: [{ id: 'a1', name: 'adiantamento-parcial.pdf', kind: 'comprovante', uploadedAt: '2026-07-20' }],
  },
  {
    id: 'rev-6',
    title: 'Comissão venda — Jardins (junho)',
    category: 'Comissão de venda',
    amount: 22500,
    date: '2026-06-28',
    source: 'COM-2026-0069',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
  },
]

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Anúncios Meta Ads',
    category: 'Marketing',
    amount: 890,
    date: '2026-07-05',
    paymentMethod: 'Cartão corporativo',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    notes: 'Campanha Vila Mariana',
    attachments: [{ id: 'a1', name: 'fatura-meta-jul.pdf', kind: 'nota', uploadedAt: '2026-07-05' }],
    recurring: true,
  },
  {
    id: 'exp-2',
    title: 'Combustível e estacionamento',
    category: 'Transporte',
    amount: 420,
    date: '2026-07-12',
    paymentMethod: 'Pix',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
    recurring: false,
  },
  {
    id: 'exp-3',
    title: 'Assinatura ImóvelHub Profissional',
    category: 'Assinaturas',
    amount: 299,
    date: '2026-07-01',
    paymentMethod: 'Cartão de crédito',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [{ id: 'a1', name: 'fatura-plano-jul.pdf', kind: 'comprovante', uploadedAt: '2026-07-01' }],
    recurring: true,
  },
  {
    id: 'exp-4',
    title: 'Página Profissional Premium',
    category: 'Assinaturas',
    amount: 497,
    date: '2026-07-01',
    paymentMethod: 'Cartão de crédito',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
    recurring: true,
  },
  {
    id: 'exp-5',
    title: 'Integração Agentes de IA',
    category: 'Ferramentas',
    amount: 97,
    date: '2026-07-01',
    paymentMethod: 'Cartão de crédito',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
    recurring: true,
  },
  {
    id: 'exp-6',
    title: 'Material gráfico impresso',
    category: 'Marketing',
    amount: 350,
    date: '2026-07-18',
    paymentMethod: 'Pix',
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    attachments: [],
    recurring: false,
  },
  {
    id: 'exp-7',
    title: 'Coworking diárias',
    category: 'Escritório',
    amount: 280,
    date: '2026-07-20',
    paymentMethod: 'Cartão',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    attachments: [],
    recurring: false,
  },
]

export const initialServices: ContractedService[] = [
  {
    id: 'svc-1',
    name: 'Assinatura ImóvelHub',
    type: 'assinatura',
    plan: 'Profissional',
    monthlyValue: 299,
    status: 'ativo',
    nextPayment: '2026-08-01',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    description: 'Plano com leads ilimitados, CRM e relatórios avançados.',
  },
  {
    id: 'svc-2',
    name: 'Página Profissional Premium',
    type: 'pagina_profissional',
    plan: 'Premium',
    monthlyValue: 497,
    status: 'ativo',
    nextPayment: '2026-08-01',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    description: 'Landing page com SEO, WhatsApp e portfólio de imóveis.',
  },
  {
    id: 'svc-3',
    name: 'Integração da IA',
    type: 'ia',
    plan: 'Agentes de IA',
    monthlyValue: 97,
    status: 'ativo',
    nextPayment: '2026-08-01',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    description: 'Respostas automáticas e qualificação de leads.',
  },
  {
    id: 'svc-4',
    name: 'Usuários adicionais',
    type: 'usuarios',
    plan: '2 usuários',
    monthlyValue: 79,
    status: 'ativo',
    nextPayment: '2026-08-01',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    description: 'Assistente e estagiário com acesso ao CRM.',
  },
  {
    id: 'svc-5',
    name: 'Domínio personalizado',
    type: 'dominio',
    plan: 'carlosimoveis.com.br',
    monthlyValue: 29,
    status: 'ativo',
    nextPayment: '2026-08-05',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    description: 'Domínio + SSL para a página profissional.',
  },
  {
    id: 'svc-6',
    name: 'Pacote fotos drone',
    type: 'outro',
    plan: 'Avulso',
    monthlyValue: 0,
    status: 'pendente',
    nextPayment: '2026-08-10',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
    description: 'Serviço pontual de R$ 450 para lançamento em Moema.',
  },
  {
    id: 'svc-7',
    name: 'Assinatura ImóvelHub',
    type: 'assinatura',
    plan: 'Profissional',
    monthlyValue: 299,
    status: 'ativo',
    nextPayment: '2026-08-01',
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    description: 'Plano Profissional da corretora Marina.',
  },
]

export const initialUpcomingPayments: UpcomingPayment[] = [
  {
    id: 'pay-1',
    title: 'Assinatura ImóvelHub Profissional',
    amount: 299,
    dueDate: '2026-08-01',
    type: 'servico',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
  {
    id: 'pay-2',
    title: 'Página Profissional Premium',
    amount: 497,
    dueDate: '2026-08-01',
    type: 'servico',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
  {
    id: 'pay-3',
    title: 'Integração Agentes de IA',
    amount: 97,
    dueDate: '2026-08-01',
    type: 'servico',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
  {
    id: 'pay-4',
    title: 'Usuários adicionais (2)',
    amount: 79,
    dueDate: '2026-08-01',
    type: 'servico',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
  {
    id: 'pay-5',
    title: 'Domínio carlosimoveis.com.br',
    amount: 29,
    dueDate: '2026-08-05',
    type: 'servico',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
  {
    id: 'pay-6',
    title: 'Split parceiro — COM-2026-0094',
    amount: 4020,
    dueDate: '2026-08-05',
    type: 'comissao_parceiro',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
  {
    id: 'pay-7',
    title: 'Meta Ads — agosto',
    amount: 890,
    dueDate: '2026-08-05',
    type: 'despesa',
    realtorId: 1,
    realtorName: 'Carlos Eduardo Silva',
  },
]

export function buildLedger(
  revenues: Revenue[],
  expenses: Expense[],
  commissions: Commission[]
): LedgerEntry[] {
  const rows: Omit<LedgerEntry, 'balanceAfter'>[] = [
    ...revenues.map((r) => ({
      id: `led-rev-${r.id}`,
      date: r.date,
      description: r.title,
      type: 'receita' as const,
      category: r.category,
      amount: r.amount,
      realtorId: r.realtorId,
      realtorName: r.realtorName,
      referenceId: r.id,
    })),
    ...expenses.map((e) => ({
      id: `led-exp-${e.id}`,
      date: e.date,
      description: e.title,
      type: 'despesa' as const,
      category: e.category,
      amount: -e.amount,
      realtorId: e.realtorId,
      realtorName: e.realtorName,
      referenceId: e.id,
    })),
    ...commissions
      .filter((c) => c.status === 'paga' || c.status === 'parcialmente_paga')
      .filter((c) => !revenues.some((r) => r.commissionId === c.id))
      .map((c) => ({
        id: `led-com-${c.id}`,
        date: c.receivedDate || c.expectedDate,
        description: `Comissão ${c.code}`,
        type: 'comissao' as const,
        category: c.dealType === 'venda' ? 'Comissão de venda' : 'Comissão de locação',
        amount: c.paidAmount,
        realtorId: c.realtorId,
        realtorName: c.realtorName,
        referenceId: c.id,
      })),
  ]

  const sorted = rows.sort((a, b) => `${a.date}${a.id}`.localeCompare(`${b.date}${b.id}`))
  let balance = 0
  return sorted.map((row) => {
    balance += row.amount
    return { ...row, balanceAfter: balance }
  })
}

export function getRealtorFinancialSummary(
  realtorId: number | null,
  commissions = initialCommissions,
  revenues = initialRevenues,
  expenses = initialExpenses,
  services = initialServices,
  upcoming = initialUpcomingPayments
) {
  const scope = <T extends { realtorId: number }>(items: T[]) =>
    realtorId === null ? items : items.filter((i) => i.realtorId === realtorId)

  const scopedCommissions = scope(commissions)
  const scopedRevenues = scope(revenues)
  const scopedExpenses = scope(expenses)
  const scopedServices = scope(services)
  const scopedUpcoming = scope(upcoming)

  const month = '2026-07'
  const monthRevenues = scopedRevenues.filter((r) => r.date.startsWith(month))
  const monthExpenses = scopedExpenses.filter((e) => e.date.startsWith(month))
  const monthRevenueTotal = monthRevenues.reduce((s, r) => s + r.amount, 0)
  const monthExpenseTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const ytdRevenue = scopedRevenues.reduce((s, r) => s + r.amount, 0)

  const expectedCommission = scopedCommissions
    .filter((c) =>
      ['calculada', 'aguardando_fechamento', 'aprovada', 'aguardando_pagamento', 'parcialmente_paga'].includes(
        c.status
      )
    )
    .reduce((s, c) => s + (c.commissionValue - c.paidAmount), 0)

  const receivedCommission = scopedCommissions
    .filter((c) => c.status === 'paga' || c.status === 'parcialmente_paga')
    .reduce((s, c) => s + c.paidAmount, 0)

  const pendingValues = scopedCommissions
    .filter((c) =>
      ['aprovada', 'aguardando_pagamento', 'parcialmente_paga'].includes(c.status)
    )
    .reduce((s, c) => s + (c.commissionValue - c.paidAmount), 0)

  const salesClosed = scopedCommissions.filter(
    (c) => c.dealType === 'venda' && (c.status === 'paga' || c.status === 'parcialmente_paga' || c.status === 'aprovada')
  ).length

  const rentalsClosed = scopedCommissions.filter(
    (c) => c.dealType === 'locacao' && (c.status === 'paga' || c.status === 'aprovada')
  ).length

  const servicesTotal = scopedServices
    .filter((s) => s.status === 'ativo')
    .reduce((s, item) => s + item.monthlyValue, 0)

  return {
    expectedCommission,
    receivedCommission,
    monthRevenue: monthRevenueTotal,
    ytdRevenue,
    salesClosed,
    rentalsClosed,
    pendingValues,
    expenses: monthExpenseTotal,
    netResult: monthRevenueTotal - monthExpenseTotal,
    servicesMonthly: servicesTotal,
    upcomingPayments: scopedUpcoming,
    commissions: scopedCommissions,
    revenues: scopedRevenues,
    expensesList: scopedExpenses,
    services: scopedServices,
  }
}

export { filterByRealtor, formatCurrency, formatDateBR }
