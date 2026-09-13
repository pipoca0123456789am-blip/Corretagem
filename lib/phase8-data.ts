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

export interface MonthlyEvolutionPoint {
  month: string
  receita: number
  despesa: number
  comissao: number
}

export const monthlyEvolution: MonthlyEvolutionPoint[] = []

export const initialCommissions: Commission[] = []

export const initialRevenues: Revenue[] = []

export const initialExpenses: Expense[] = []

export const initialServices: ContractedService[] = []

export const initialUpcomingPayments: UpcomingPayment[] = []

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
