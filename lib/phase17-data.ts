import { filterByRealtor, formatCurrency, getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import { PROFESSIONAL_PAGE_PRICE } from '@/lib/phase12-data'
import { AI_INTEGRATION_PRICE } from '@/lib/phase13-data'

export type ReportPeriod = '7d' | '30d' | '90d' | '12m'
export type ReportStatusFilter = 'all' | 'ativo' | 'publicado' | 'vendido' | 'alugado' | 'pendente'

export interface MetricPoint {
  label: string
  value: number
  previous?: number
}

export interface SeriesPoint {
  label: string
  atual: number
  anterior: number
}

export interface RankItem {
  id: string
  name: string
  value: number
  unit?: 'currency' | 'number' | 'percent'
  meta?: string
}

export interface GoalItem {
  id: string
  label: string
  current: number
  target: number
  unit: 'currency' | 'number' | 'percent'
}

export interface InsightItem {
  id: string
  tone: 'positivo' | 'atencao' | 'neutro'
  title: string
  text: string
}

export interface TableRow {
  id: string
  label: string
  status: string
  value: number
  secondary?: string
  unit?: 'currency' | 'number' | 'percent'
}

export interface RealtorReportBundle {
  realtorId: number
  realtorName: string
  summary: {
    imoveisCadastrados: number
    imoveisPublicados: number
    imoveisVendidos: number
    imoveisAlugados: number
    visualizacoes: number
    cliques: number
    favoritos: number
    compartilhamentos: number
    leads: number
    conversao: number
    tempoRespostaMin: number
    visitas: number
    propostas: number
    negociacoes: number
    vendas: number
    locacoes: number
    comissoes: number
    receita: number
    campanhas: number
    paginaPublicaViews: number
    paginaProfissionalViews: number
    iaConversas: number
    whatsappMensagens: number
  }
  deltas: Record<string, number>
  series: {
    leads: SeriesPoint[]
    receita: SeriesPoint[]
    visualizacoes: SeriesPoint[]
    visitas: SeriesPoint[]
  }
  leadOrigins: MetricPoint[]
  rankings: RankItem[]
  goals: GoalItem[]
  insights: InsightItem[]
  tables: {
    imoveis: TableRow[]
    leads: TableRow[]
    vendas: TableRow[]
    campanhas: TableRow[]
  }
}

export interface AdminReportBundle {
  summary: {
    receita: number
    receitaRecorrente: number
    assinaturas: number
    planosAtivos: number
    testes: number
    upgrades: number
    downgrades: number
    inadimplencia: number
    cancelamentos: number
    crescimento: number
    corretoresAtivos: number
    paginasProfissionais: number
    integracoesIa: number
    consumoIa: number
    chamados: number
    tempoAtendimentoH: number
    imoveis: number
    clientes: number
    leadsPlataforma: number
  }
  deltas: Record<string, number>
  series: {
    receita: SeriesPoint[]
    assinaturas: SeriesPoint[]
    corretores: SeriesPoint[]
    chamados: SeriesPoint[]
  }
  planosDistribuicao: MetricPoint[]
  rankings: RankItem[]
  goals: GoalItem[]
  insights: InsightItem[]
  tables: {
    planos: TableRow[]
    corretores: TableRow[]
    financeiro: TableRow[]
    suporte: TableRow[]
  }
}

export const periodLabels: Record<ReportPeriod, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  '12m': 'Últimos 12 meses',
}

export const statusFilterLabels: Record<ReportStatusFilter, string> = {
  all: 'Todos os status',
  ativo: 'Ativo',
  publicado: 'Publicado',
  vendido: 'Vendido',
  alugado: 'Alugado',
  pendente: 'Pendente',
}

function scaleByPeriod(base: number, period: ReportPeriod): number {
  const map = { '7d': 0.28, '30d': 1, '90d': 2.7, '12m': 9.5 }
  return Math.round(base * map[period])
}

function deltaFor(key: string, period: ReportPeriod): number {
  const seeds: Record<string, number[]> = {
    default: [8.4, 12.1, -3.2, 5.6, 18.0, -6.5, 2.1, 9.8],
  }
  const arr = seeds.default
  const idx = (key.length + period.length) % arr.length
  return arr[idx]
}

const realtorSeeds: Omit<RealtorReportBundle, 'deltas' | 'series'>[] = [
  {
    realtorId: 1,
    realtorName: 'Corretor Demonstração',
    summary: {
      imoveisCadastrados: 0,
      imoveisPublicados: 0,
      imoveisVendidos: 0,
      imoveisAlugados: 0,
      visualizacoes: 0,
      cliques: 0,
      favoritos: 0,
      compartilhamentos: 0,
      leads: 0,
      conversao: 0,
      tempoRespostaMin: 0,
      visitas: 0,
      propostas: 0,
      negociacoes: 0,
      vendas: 0,
      locacoes: 0,
      comissoes: 0,
      receita: 0,
      campanhas: 0,
      paginaPublicaViews: 0,
      paginaProfissionalViews: 0,
      iaConversas: 0,
      whatsappMensagens: 0,
    },
    leadOrigins: [],
    rankings: [],
    goals: [],
    insights: [],
    tables: {
      imoveis: [],
      leads: [],
      vendas: [],
      campanhas: [],
    },
  },
]

function buildSeries(base: number, period: ReportPeriod): SeriesPoint[] {
  const labels =
    period === '7d'
      ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
      : period === '12m'
        ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        : period === '90d'
          ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6']
          : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  return labels.map((label, i) => {
    const fator = 0.7 + ((i % 5) * 0.12)
    const atual = Math.round((base / labels.length) * fator)
    const anterior = Math.round(atual * (0.85 + (i % 3) * 0.05))
    return { label, atual, anterior }
  })
}

function applyPeriodToSummary<T extends Record<string, number>>(summary: T, period: ReportPeriod): T {
  const next = { ...summary }
  ;(Object.keys(next) as (keyof T)[]).forEach((key) => {
    const val = next[key]
    if (typeof val === 'number' && !String(key).includes('conversao') && !String(key).includes('tempo')) {
      next[key] = scaleByPeriod(val, period) as T[keyof T]
    }
  })
  return next
}

export function getRealtorReport(
  period: ReportPeriod = '30d',
  realtorId?: number | null
): RealtorReportBundle | null {
  const id = realtorId ?? getCurrentRealtorId()
  if (id === null && isSuperAdmin()) {
    // admin viewing realtor module shouldn't use this; return first as demo fallback for UI previews
    return buildRealtorBundle(realtorSeeds[0], period)
  }
  const seed = realtorSeeds.find((r) => r.realtorId === id) || realtorSeeds[0]
  return buildRealtorBundle(seed, period)
}

function buildRealtorBundle(
  seed: (typeof realtorSeeds)[number],
  period: ReportPeriod
): RealtorReportBundle {
  const summary = applyPeriodToSummary(seed.summary, period)
  const deltas: Record<string, number> = {}
  Object.keys(summary).forEach((k) => {
    deltas[k] = deltaFor(k, period)
  })
  return {
    ...seed,
    summary,
    deltas,
    series: {
      leads: buildSeries(summary.leads, period),
      receita: buildSeries(summary.receita / 1000, period).map((p) => ({
        ...p,
        atual: p.atual * 1000,
        anterior: p.anterior * 1000,
      })),
      visualizacoes: buildSeries(summary.visualizacoes, period),
      visitas: buildSeries(summary.visitas, period),
    },
  }
}

export function getAdminReport(period: ReportPeriod = '30d'): AdminReportBundle {
  const base = {
    receita: 0,
    receitaRecorrente: 0,
    assinaturas: 0,
    planosAtivos: 3,
    testes: 0,
    upgrades: 0,
    downgrades: 0,
    inadimplencia: 0,
    cancelamentos: 0,
    crescimento: 0,
    corretoresAtivos: 0,
    paginasProfissionais: 0,
    integracoesIa: 0,
    consumoIa: 0,
    chamados: 0,
    tempoAtendimentoH: 0,
    imoveis: 0,
    clientes: 0,
    leadsPlataforma: 0,
  }
  const summary = applyPeriodToSummary(base, period)
  summary.crescimento = 0
  summary.tempoAtendimentoH = 0

  const deltas: Record<string, number> = {}
  Object.keys(summary).forEach((k) => {
    deltas[k] = 0
  })

  return {
    summary,
    deltas,
    series: {
      receita: buildSeries(summary.receita / 1000, period).map((p) => ({
        ...p,
        atual: p.atual * 1000,
        anterior: p.anterior * 1000,
      })),
      assinaturas: buildSeries(summary.assinaturas, period),
      corretores: buildSeries(summary.corretoresAtivos / 10, period).map((p) => ({
        ...p,
        atual: p.atual * 10,
        anterior: p.anterior * 10,
      })),
      chamados: buildSeries(summary.chamados, period),
    },
    planosDistribuicao: [
      { label: 'Essencial', value: 0 },
      { label: 'Profissional', value: 0 },
      { label: 'Premium', value: 0 },
    ],
    rankings: [],
    goals: [
      { id: 'ag1', label: 'MRR', current: 0, target: 0, unit: 'currency' },
      { id: 'ag2', label: 'Corretores ativos', current: 0, target: 0, unit: 'number' },
      { id: 'ag3', label: 'Páginas profissionais', current: 0, target: 0, unit: 'number' },
      { id: 'ag4', label: 'Churn / cancelamentos', current: 0, target: 0, unit: 'number' },
    ],
    insights: [
      {
        id: 'ai1',
        tone: 'neutro',
        title: 'Plataforma pronta para operar',
        text: 'Métricas zeradas. Os números passam a refletir a operação real conforme o uso.',
      },
    ],
    tables: {
      planos: [
        { id: 'pl1', label: 'Plano Essencial', status: 'ativo', value: 69.9, unit: 'currency', secondary: 'Catálogo' },
        { id: 'pl2', label: 'Plano Profissional', status: 'ativo', value: 149.9, unit: 'currency', secondary: 'Catálogo' },
        { id: 'pl3', label: 'Plano Premium', status: 'ativo', value: 299.9, unit: 'currency', secondary: 'Catálogo' },
      ],
      corretores: [],
      financeiro: [
        { id: 'f1', label: 'Receita de assinaturas', status: 'ativo', value: 0, unit: 'currency', secondary: 'MRR' },
        { id: 'f2', label: 'Páginas profissionais', status: 'ativo', value: 0, unit: 'currency', secondary: 'Único' },
        { id: 'f3', label: 'Integrações IA', status: 'ativo', value: 0, unit: 'currency', secondary: 'Sugerido' },
        { id: 'f4', label: 'Inadimplência estimada', status: 'pendente', value: 0, unit: 'currency', secondary: 'Risco' },
      ],
      suporte: [
        { id: 's1', label: 'Chamados abertos', status: 'ativo', value: 0, secondary: 'Fila' },
        { id: 's2', label: 'Resolvidos', status: 'ativo', value: 0, secondary: 'Período' },
        { id: 's3', label: 'Reabertos', status: 'pendente', value: 0, secondary: 'Atenção' },
        { id: 's4', label: 'Tempo médio (h)', status: 'ativo', value: 0, unit: 'number', secondary: 'SLA visual' },
      ],
    },
  }
}

export function filterTableRows(rows: TableRow[], status: ReportStatusFilter): TableRow[] {
  if (status === 'all') return rows
  return rows.filter((r) => r.status === status)
}

export function formatMetricValue(
  value: number,
  unit: 'currency' | 'number' | 'percent' = 'number'
): string {
  if (unit === 'currency') return formatCurrency(value)
  if (unit === 'percent') return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
  return value.toLocaleString('pt-BR')
}

export function goalProgress(goal: GoalItem): number {
  if (goal.target <= 0) return 0
  // for churn-like goals where lower is better when label includes cancel
  if (goal.label.toLowerCase().includes('churn') || goal.label.toLowerCase().includes('cancel')) {
    const ratio = goal.current <= goal.target ? 100 : Math.max(0, 100 - ((goal.current - goal.target) / goal.target) * 100)
    return Math.round(Math.min(100, ratio))
  }
  return Math.round(Math.min(100, (goal.current / goal.target) * 100))
}

export function scopedRealtorId(): number {
  const id = getCurrentRealtorId()
  return id ?? 1
}

export { formatCurrency, filterByRealtor, PROFESSIONAL_PAGE_PRICE, AI_INTEGRATION_PRICE }
