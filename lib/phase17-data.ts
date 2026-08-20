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
    realtorName: 'Carlos Eduardo Silva',
    summary: {
      imoveisCadastrados: 42,
      imoveisPublicados: 31,
      imoveisVendidos: 4,
      imoveisAlugados: 3,
      visualizacoes: 18420,
      cliques: 3260,
      favoritos: 412,
      compartilhamentos: 188,
      leads: 146,
      conversao: 18.4,
      tempoRespostaMin: 14,
      visitas: 58,
      propostas: 22,
      negociacoes: 11,
      vendas: 4,
      locacoes: 3,
      comissoes: 68400,
      receita: 91200,
      campanhas: 5,
      paginaPublicaViews: 6420,
      paginaProfissionalViews: 2180,
      iaConversas: 312,
      whatsappMensagens: 1480,
    },
    leadOrigins: [
      { label: 'Página pública', value: 38 },
      { label: 'WhatsApp / IA', value: 29 },
      { label: 'Indicação', value: 18 },
      { label: 'Campanhas', value: 10 },
      { label: 'Outros', value: 5 },
    ],
    rankings: [
      { id: 'r1', name: 'Apto Jardins 120 m²', value: 2840, meta: 'visualizações' },
      { id: 'r2', name: 'Casa Alphaville', value: 1920, meta: 'visualizações' },
      { id: 'r3', name: 'Cobertura Moema', value: 1510, meta: 'visualizações' },
      { id: 'r4', name: 'Studio Pinheiros', value: 980, meta: 'visualizações' },
    ],
    goals: [
      { id: 'g1', label: 'Leads no mês', current: 146, target: 160, unit: 'number' },
      { id: 'g2', label: 'Comissões', current: 68400, target: 80000, unit: 'currency' },
      { id: 'g3', label: 'Taxa de conversão', current: 18.4, target: 20, unit: 'percent' },
      { id: 'g4', label: 'Visitas realizadas', current: 58, target: 70, unit: 'number' },
    ],
    insights: [
      {
        id: 'i1',
        tone: 'positivo',
        title: 'Página pública performando',
        text: 'A origem “Página pública” concentra 38% dos leads. Vale reforçar CTA e imóveis em destaque.',
      },
      {
        id: 'i2',
        tone: 'atencao',
        title: 'Tempo de resposta',
        text: 'Média de 14 min. Leads de WhatsApp/IA convertem mais quando respondidos em até 10 min.',
      },
      {
        id: 'i3',
        tone: 'neutro',
        title: 'Campanhas',
        text: '5 campanhas ativas geraram 10% dos leads. Avalie pausar as de menor CTR.',
      },
    ],
    tables: {
      imoveis: [
        { id: 'p1', label: 'Apto Jardins 120 m²', status: 'publicado', value: 2840, secondary: '126 cliques' },
        { id: 'p2', label: 'Casa Alphaville', status: 'publicado', value: 1920, secondary: '98 cliques' },
        { id: 'p3', label: 'Cobertura Moema', status: 'vendido', value: 1510, secondary: 'Vendido' },
        { id: 'p4', label: 'Studio Pinheiros', status: 'alugado', value: 980, secondary: 'Alugado' },
        { id: 'p5', label: 'Sala Paulista', status: 'pendente', value: 240, secondary: 'Em revisão' },
      ],
      leads: [
        { id: 'l1', label: 'Ana Souza', status: 'ativo', value: 1, secondary: 'Página pública · quente' },
        { id: 'l2', label: 'João Pedro', status: 'ativo', value: 1, secondary: 'WhatsApp · visita agendada' },
        { id: 'l3', label: 'Carla Mendes', status: 'pendente', value: 1, secondary: 'Campanha · sem resposta' },
        { id: 'l4', label: 'Ricardo Alves', status: 'ativo', value: 1, secondary: 'Indicação · proposta' },
      ],
      vendas: [
        { id: 'v1', label: 'Cobertura Moema', status: 'vendido', value: 28500, unit: 'currency', secondary: 'Comissão 3%' },
        { id: 'v2', label: 'Apto Brooklin', status: 'vendido', value: 19200, unit: 'currency', secondary: 'Comissão 2,5%' },
        { id: 'v3', label: 'Casa Interlagos', status: 'alugado', value: 4200, unit: 'currency', secondary: 'Locação' },
      ],
      campanhas: [
        { id: 'c1', label: 'Lançamento Jardins', status: 'ativo', value: 4.8, unit: 'percent', secondary: 'CTR' },
        { id: 'c2', label: 'Remarketing WhatsApp', status: 'ativo', value: 6.1, unit: 'percent', secondary: 'CTR' },
        { id: 'c3', label: 'Stories página pública', status: 'pendente', value: 2.2, unit: 'percent', secondary: 'CTR' },
      ],
    },
  },
  {
    realtorId: 2,
    realtorName: 'Marina Costa Santos',
    summary: {
      imoveisCadastrados: 55,
      imoveisPublicados: 44,
      imoveisVendidos: 6,
      imoveisAlugados: 5,
      visualizacoes: 24100,
      cliques: 4100,
      favoritos: 520,
      compartilhamentos: 240,
      leads: 188,
      conversao: 21.2,
      tempoRespostaMin: 9,
      visitas: 72,
      propostas: 31,
      negociacoes: 15,
      vendas: 6,
      locacoes: 5,
      comissoes: 92400,
      receita: 118500,
      campanhas: 7,
      paginaPublicaViews: 8120,
      paginaProfissionalViews: 4560,
      iaConversas: 498,
      whatsappMensagens: 2100,
    },
    leadOrigins: [
      { label: 'Página profissional', value: 34 },
      { label: 'Página pública', value: 26 },
      { label: 'WhatsApp / IA', value: 24 },
      { label: 'Indicação', value: 10 },
      { label: 'Campanhas', value: 6 },
    ],
    rankings: [
      { id: 'r1', name: 'Casa Alphaville Premium', value: 3200, meta: 'visualizações' },
      { id: 'r2', name: 'Apto Tamboré', value: 2100, meta: 'visualizações' },
      { id: 'r3', name: 'Terreno Santana', value: 980, meta: 'visualizações' },
    ],
    goals: [
      { id: 'g1', label: 'Leads no mês', current: 188, target: 180, unit: 'number' },
      { id: 'g2', label: 'Comissões', current: 92400, target: 95000, unit: 'currency' },
      { id: 'g3', label: 'Taxa de conversão', current: 21.2, target: 22, unit: 'percent' },
      { id: 'g4', label: 'Visitas realizadas', current: 72, target: 80, unit: 'number' },
    ],
    insights: [
      {
        id: 'i1',
        tone: 'positivo',
        title: 'Meta de leads superada',
        text: 'Você ultrapassou a meta de leads. A página profissional concentra 34% da origem.',
      },
      {
        id: 'i2',
        tone: 'positivo',
        title: 'Resposta rápida',
        text: 'Tempo médio de 9 min está acima da média da plataforma e ajuda a conversão.',
      },
      {
        id: 'i3',
        tone: 'atencao',
        title: 'Comissões perto da meta',
        text: 'Faltam cerca de R$ 2.600 para a meta de comissões do período.',
      },
    ],
    tables: {
      imoveis: [
        { id: 'p1', label: 'Casa Alphaville Premium', status: 'publicado', value: 3200, secondary: '210 cliques' },
        { id: 'p2', label: 'Apto Tamboré', status: 'vendido', value: 2100, secondary: 'Vendido' },
        { id: 'p3', label: 'Terreno Santana', status: 'publicado', value: 980, secondary: '44 cliques' },
      ],
      leads: [
        { id: 'l1', label: 'Fernanda Dias', status: 'ativo', value: 1, secondary: 'Página profissional' },
        { id: 'l2', label: 'Lucas Prado', status: 'ativo', value: 1, secondary: 'IA WhatsApp' },
      ],
      vendas: [
        { id: 'v1', label: 'Apto Tamboré', status: 'vendido', value: 31200, unit: 'currency', secondary: 'Comissão' },
        { id: 'v2', label: 'Casa Barueri', status: 'alugado', value: 5800, unit: 'currency', secondary: 'Locação' },
      ],
      campanhas: [
        { id: 'c1', label: 'Google Ads Alphaville', status: 'ativo', value: 5.4, unit: 'percent', secondary: 'CTR' },
      ],
    },
  },
  {
    realtorId: 3,
    realtorName: 'Roberto Ferreira Junior',
    summary: {
      imoveisCadastrados: 18,
      imoveisPublicados: 12,
      imoveisVendidos: 1,
      imoveisAlugados: 1,
      visualizacoes: 4200,
      cliques: 680,
      favoritos: 74,
      compartilhamentos: 32,
      leads: 41,
      conversao: 9.8,
      tempoRespostaMin: 28,
      visitas: 14,
      propostas: 5,
      negociacoes: 2,
      vendas: 1,
      locacoes: 1,
      comissoes: 12800,
      receita: 15600,
      campanhas: 1,
      paginaPublicaViews: 1100,
      paginaProfissionalViews: 0,
      iaConversas: 0,
      whatsappMensagens: 220,
    },
    leadOrigins: [
      { label: 'Página pública', value: 45 },
      { label: 'Indicação', value: 30 },
      { label: 'WhatsApp', value: 15 },
      { label: 'Outros', value: 10 },
    ],
    rankings: [
      { id: 'r1', name: 'Apto Botafogo', value: 860, meta: 'visualizações' },
      { id: 'r2', name: 'Kitnet Copacabana', value: 540, meta: 'visualizações' },
    ],
    goals: [
      { id: 'g1', label: 'Leads no mês', current: 41, target: 60, unit: 'number' },
      { id: 'g2', label: 'Comissões', current: 12800, target: 25000, unit: 'currency' },
      { id: 'g3', label: 'Taxa de conversão', current: 9.8, target: 15, unit: 'percent' },
      { id: 'g4', label: 'Visitas realizadas', current: 14, target: 25, unit: 'number' },
    ],
    insights: [
      {
        id: 'i1',
        tone: 'atencao',
        title: 'Tempo de resposta elevado',
        text: 'Média de 28 min. Reduzir para menos de 15 min tende a melhorar a conversão.',
      },
      {
        id: 'i2',
        tone: 'neutro',
        title: 'Sem página profissional',
        text: 'Ainda não há visualizações de página profissional. Considere o serviço de R$ 497.',
      },
      {
        id: 'i3',
        tone: 'atencao',
        title: 'Metas abaixo do ritmo',
        text: 'Leads e comissões estão abaixo da meta do período. Foque em publicar mais imóveis.',
      },
    ],
    tables: {
      imoveis: [
        { id: 'p1', label: 'Apto Botafogo', status: 'publicado', value: 860, secondary: '32 cliques' },
        { id: 'p2', label: 'Kitnet Copacabana', status: 'alugado', value: 540, secondary: 'Alugado' },
        { id: 'p3', label: 'Sala Centro', status: 'pendente', value: 90, secondary: 'Rascunho' },
      ],
      leads: [
        { id: 'l1', label: 'Paulo Nogueira', status: 'pendente', value: 1, secondary: 'Sem follow-up' },
      ],
      vendas: [
        { id: 'v1', label: 'Kitnet Copacabana', status: 'alugado', value: 2100, unit: 'currency', secondary: 'Locação' },
      ],
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
    receita: 245320,
    receitaRecorrente: 186400,
    assinaturas: 247,
    planosAtivos: 3,
    testes: 34,
    upgrades: 18,
    downgrades: 6,
    inadimplencia: 11,
    cancelamentos: 9,
    crescimento: 8.4,
    corretoresAtivos: 1243,
    paginasProfissionais: 156,
    integracoesIa: 89,
    consumoIa: 28470,
    chamados: 128,
    tempoAtendimentoH: 4.2,
    imoveis: 5847,
    clientes: 9320,
    leadsPlataforma: 18420,
  }
  const summary = applyPeriodToSummary(base, period)
  // keep growth and tempo as rates
  summary.crescimento = base.crescimento + (period === '7d' ? -1.2 : period === '12m' ? 3.1 : 0)
  summary.tempoAtendimentoH = base.tempoAtendimentoH

  const deltas: Record<string, number> = {}
  Object.keys(summary).forEach((k) => {
    deltas[k] = deltaFor(`admin-${k}`, period)
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
      { label: 'Inicial', value: 42 },
      { label: 'Profissional', value: 38 },
      { label: 'Premium', value: 20 },
    ],
    rankings: [
      { id: 'a1', name: 'Marina Costa Santos', value: 118500, unit: 'currency', meta: 'receita corretor' },
      { id: 'a2', name: 'Carlos Eduardo Silva', value: 91200, unit: 'currency', meta: 'receita corretor' },
      { id: 'a3', name: 'Juliana Lima Oliveira', value: 76400, unit: 'currency', meta: 'receita corretor' },
      { id: 'a4', name: 'Roberto Ferreira Junior', value: 15600, unit: 'currency', meta: 'receita corretor' },
    ],
    goals: [
      { id: 'ag1', label: 'MRR', current: summary.receitaRecorrente, target: summary.receitaRecorrente * 1.08, unit: 'currency' },
      { id: 'ag2', label: 'Corretores ativos', current: summary.corretoresAtivos, target: Math.round(summary.corretoresAtivos * 1.05), unit: 'number' },
      { id: 'ag3', label: 'Páginas profissionais', current: summary.paginasProfissionais, target: summary.paginasProfissionais + 20, unit: 'number' },
      { id: 'ag4', label: 'Churn / cancelamentos', current: summary.cancelamentos, target: Math.max(5, summary.cancelamentos - 3), unit: 'number' },
    ],
    insights: [
      {
        id: 'ai1',
        tone: 'positivo',
        title: 'Receita recorrente estável',
        text: `MRR simulado de ${formatCurrency(summary.receitaRecorrente)}. Upgrades (${summary.upgrades}) superam downgrades (${summary.downgrades}).`,
      },
      {
        id: 'ai2',
        tone: 'atencao',
        title: 'Inadimplência',
        text: `${summary.inadimplencia} assinaturas inadimplentes no período. Priorize a fila financeira.`,
      },
      {
        id: 'ai3',
        tone: 'neutro',
        title: 'Add-ons',
        text: `${summary.paginasProfissionais} páginas profissionais (ref. ${formatCurrency(PROFESSIONAL_PAGE_PRICE)}) e ${summary.integracoesIa} IAs (ref. ${formatCurrency(AI_INTEGRATION_PRICE)}).`,
      },
      {
        id: 'ai4',
        tone: 'positivo',
        title: 'Suporte',
        text: `Tempo médio de atendimento em ${summary.tempoAtendimentoH}h com ${summary.chamados} chamados no recorte.`,
      },
    ],
    tables: {
      planos: [
        { id: 'pl1', label: 'Plano Essencial', status: 'ativo', value: 69.9, unit: 'currency', secondary: 'Preço provisório' },
        { id: 'pl2', label: 'Plano Profissional', status: 'ativo', value: 299, unit: 'currency', secondary: 'Mais escolhido' },
        { id: 'pl3', label: 'Plano Premium', status: 'ativo', value: 499, unit: 'currency', secondary: 'Preço provisório' },
      ],
      corretores: [
        { id: 'cr1', label: 'Marina Costa Santos', status: 'ativo', value: 299, unit: 'currency', secondary: 'Profissional' },
        { id: 'cr2', label: 'Carlos Eduardo Silva', status: 'ativo', value: 299, unit: 'currency', secondary: 'Profissional' },
        { id: 'cr3', label: 'Roberto Ferreira Junior', status: 'pendente', value: 149, unit: 'currency', secondary: 'Inicial · trial' },
        { id: 'cr4', label: 'Conta teste demo', status: 'pendente', value: 0, unit: 'currency', secondary: 'Teste gratuito' },
      ],
      financeiro: [
        { id: 'f1', label: 'Receita de assinaturas', status: 'ativo', value: summary.receitaRecorrente, unit: 'currency', secondary: 'MRR' },
        { id: 'f2', label: 'Páginas profissionais', status: 'ativo', value: summary.paginasProfissionais * PROFESSIONAL_PAGE_PRICE, unit: 'currency', secondary: 'Único' },
        { id: 'f3', label: 'Integrações IA', status: 'ativo', value: summary.integracoesIa * AI_INTEGRATION_PRICE, unit: 'currency', secondary: 'Sugerido' },
        { id: 'f4', label: 'Inadimplência estimada', status: 'pendente', value: summary.inadimplencia * 299, unit: 'currency', secondary: 'Risco' },
      ],
      suporte: [
        { id: 's1', label: 'Chamados abertos', status: 'ativo', value: Math.round(summary.chamados * 0.35), secondary: 'Fila' },
        { id: 's2', label: 'Resolvidos', status: 'ativo', value: Math.round(summary.chamados * 0.55), secondary: 'Período' },
        { id: 's3', label: 'Reabertos', status: 'pendente', value: Math.round(summary.chamados * 0.1), secondary: 'Atenção' },
        { id: 's4', label: 'Tempo médio (h)', status: 'ativo', value: summary.tempoAtendimentoH, unit: 'number', secondary: 'SLA visual' },
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
