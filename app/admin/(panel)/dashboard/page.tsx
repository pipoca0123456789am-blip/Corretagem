'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  Globe2,
  Headset,
  Megaphone,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { propertiesList, realtorsList } from '@/lib/mock-data'
import { isSuperAdmin } from '@/lib/auth'
import { labelPt, planNameLabels } from '@/lib/labels-pt'
import {
  getAllProfessionalRequests,
  professionalStatusLabels,
  type ProfessionalRequestStatus,
} from '@/lib/phase12-data'
import { getAllAiIntegrations, aiStatusLabels } from '@/lib/phase13-data'
import {
  loadInvoices,
  loadPlans,
  loadSubscriptions,
  saasPlans,
  subscriptionStatusLabels,
  type Invoice,
  type Subscription,
} from '@/lib/phase14-data'
import { loadTickets, loadRequests, supportReportMetrics } from '@/lib/phase16-data'
import { publicRealtorProfiles } from '@/lib/phase9-data'

const moduleDefs = [
  {
    title: 'Corretores',
    description: 'Contas, status, planos e ficha completa de cada corretor.',
    href: '/admin/realtors',
  },
  {
    title: 'Páginas profissionais',
    description: 'Produção, aprovação e vitrines publicadas por corretor.',
    href: '/admin/professional',
  },
  {
    title: 'Agentes de IA',
    description: 'Integrações WhatsApp isoladas por carteira.',
    href: '/admin/ai',
  },
  {
    title: 'Assinaturas',
    description: 'Planos SaaS, inadimplência, trials e renovações.',
    href: '/admin/subscriptions',
  },
  {
    title: 'Imóveis (global)',
    description: 'Monitoramento de todas as carteiras sem misturar operação.',
    href: '/admin/properties',
  },
  {
    title: 'Suporte',
    description: 'Fila de chamados, SLA e atendimento da plataforma.',
    href: '/admin/support',
  },
  {
    title: 'Solicitações',
    description: 'Pedidos de add-ons, usuários extras e serviços.',
    href: '/admin/requests',
  },
  {
    title: 'Financeiro da plataforma',
    description: 'Receita recorrente, add-ons e visão da operação.',
    href: '/admin/financial',
  },
  {
    title: 'Usuários e permissões',
    description: 'Contas administrativas, papéis e acessos cadastrados.',
    href: '/admin/users',
  },
  {
    title: 'Comunicação',
    description: 'Comunicados e mensagens para os usuários da plataforma.',
    href: '/admin/communication',
  },
  {
    title: 'Relatórios e auditoria',
    description: 'Indicadores globais e histórico de atividades administrativas.',
    href: '/admin/reports',
  },
  {
    title: 'Segurança e configurações',
    description: 'Autenticação em dois fatores e preferências do sistema.',
    href: '/admin/security/2fa',
  },
] as const

type DashboardPeriod = 6 | 12

interface DashboardMonth {
  key: string
  label: string
  revenue: number
  subscriptions: number
}

function getMonthKey(value: string | undefined): string | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})/.exec(value)
  return match ? `${match[1]}-${match[2]}` : null
}

function buildMonthlySeries(
  period: DashboardPeriod,
  invoices: Invoice[],
  subscriptions: Subscription[]
): DashboardMonth[] {
  const current = new Date()
  const firstMonth = new Date(current.getFullYear(), current.getMonth() - period + 1, 1)

  return Array.from({ length: period }, (_, index) => {
    const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    return {
      key,
      label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      revenue: invoices
        .filter((invoice) => invoice.status === 'aprovado' && getMonthKey(invoice.paidAt) === key)
        .reduce((total, invoice) => total + invoice.amount, 0),
      subscriptions: subscriptions.filter((subscription) => getMonthKey(subscription.startedAt) === key)
        .length,
    }
  })
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function DashboardStat({
  title,
  value,
  detail,
  icon,
  href,
  tone = 'amber',
}: {
  title: string
  value: string | number
  detail: string
  icon: React.ReactNode
  href: string
  tone?: 'amber' | 'green' | 'blue' | 'rose'
}) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    blue: 'bg-sky-50 text-sky-700 ring-sky-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </Link>
  )
}

function RevenueChart({ data }: { data: DashboardMonth[] }) {
  const width = 660
  const height = 250
  const left = 58
  const right = 642
  const top = 18
  const bottom = 194
  const maxValue = Math.max(...data.map((item) => item.revenue), 1)
  const points = data.map((item, index) => ({
    ...item,
    x: left + (index / Math.max(data.length - 1, 1)) * (right - left),
    y: bottom - (item.revenue / (maxValue * 1.15)) * (bottom - top),
  }))
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const areaPath = `${linePath} L ${right} ${bottom} L ${left} ${bottom} Z`
  const hasRevenue = data.some((item) => item.revenue > 0)

  return (
    <div className="relative">
      <svg
        className="h-auto w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Gráfico de receita mensal confirmada por faturas pagas"
      >
        <defs>
          <linearGradient id="admin-revenue-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((tick) => {
          const y = top + ((bottom - top) / 3) * tick
          const value = (maxValue * (3 - tick)) / 3
          return (
            <g key={tick}>
              <line x1={left} x2={right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />
              <text x={left - 10} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
                {value >= 1000
                  ? `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`
                  : formatCurrency(value)}
              </text>
            </g>
          )
        })}
        <path d={areaPath} fill="url(#admin-revenue-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#d97706"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <g key={point.key}>
            <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#d97706" strokeWidth="3">
              <title>{`${point.label}: ${formatCurrency(point.revenue)}`}</title>
            </circle>
            <text x={point.x} y={bottom + 24} textAnchor="middle" className="fill-slate-500 text-[11px]">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      {!hasRevenue ? (
        <div className="pointer-events-none absolute inset-x-16 top-1/3 rounded-xl border border-dashed border-slate-200 bg-white/90 px-4 py-3 text-center">
          <p className="text-sm font-medium text-slate-700">Ainda não há pagamentos confirmados</p>
          <p className="mt-1 text-xs text-slate-500">A receita aparecerá aqui quando as faturas forem pagas.</p>
        </div>
      ) : null}
    </div>
  )
}

function SubscriptionChart({ data }: { data: DashboardMonth[] }) {
  const maxValue = Math.max(...data.map((item) => item.subscriptions), 1)
  const hasSubscriptions = data.some((item) => item.subscriptions > 0)

  return (
    <div className="relative">
      <div className="flex h-52 items-end gap-2 border-b border-slate-200 px-1 pb-7 pt-4">
        {data.map((item) => (
          <div key={item.key} className="group relative flex h-full min-w-0 flex-1 items-end justify-center">
            {item.subscriptions > 0 ? (
              <span className="absolute bottom-[calc(100%+4px)] text-[10px] font-semibold text-slate-500 opacity-0 transition group-hover:opacity-100">
                {item.subscriptions}
              </span>
            ) : null}
            <div
              className={`w-full max-w-8 rounded-t-md transition ${
                item.subscriptions > 0 ? 'bg-sky-500 group-hover:bg-sky-600' : 'bg-slate-100'
              }`}
              style={{
                height: `${item.subscriptions > 0 ? Math.max((item.subscriptions / maxValue) * 100, 8) : 3}%`,
              }}
              title={`${item.subscriptions} novas assinaturas`}
            />
            <span className="absolute -bottom-6 truncate text-[10px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
      {!hasSubscriptions ? (
        <div className="pointer-events-none absolute inset-x-4 top-1/3 rounded-xl border border-dashed border-slate-200 bg-white/90 px-4 py-3 text-center">
          <p className="text-sm font-medium text-slate-700">Sem novas assinaturas neste período</p>
          <p className="mt-1 text-xs text-slate-500">Novos planos contratados serão exibidos aqui.</p>
        </div>
      ) : null}
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [pages, setPages] = useState<ReturnType<typeof getAllProfessionalRequests>>([])
  const [ais, setAis] = useState<ReturnType<typeof getAllAiIntegrations>>([])
  const [subs, setSubs] = useState<ReturnType<typeof loadSubscriptions>>([])
  const [invoices, setInvoices] = useState<ReturnType<typeof loadInvoices>>([])
  const [plans, setPlans] = useState(saasPlans)
  const [ticketOpen, setTicketOpen] = useState(0)
  const [requestsPending, setRequestsPending] = useState(0)
  const [period, setPeriod] = useState<DashboardPeriod>(6)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refreshDashboard = useCallback(() => {
    const professional = getAllProfessionalRequests()
    const ai = getAllAiIntegrations()
    const subscriptions = loadSubscriptions()
    const tickets = loadTickets()
    const requests = loadRequests()
    setPages(professional)
    setAis(ai)
    setSubs(subscriptions)
    setInvoices(loadInvoices())
    setPlans(loadPlans())
    setTicketOpen(supportReportMetrics(tickets).open)
    setRequestsPending(
      requests.filter((r) => !['concluida', 'recusada', 'cancelada'].includes(r.status)).length
    )
    setLastUpdated(new Date())
  }, [])

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    refreshDashboard()
  }, [refreshDashboard, router])

  const publishedPages = useMemo(
    () => pages.filter((p) => p.status === 'publicado').length || publicRealtorProfiles.length,
    [pages]
  )

  const attention = useMemo(() => {
    const delinquent = subs.filter((s) => s.status === 'inadimplente' || s.status === 'pendente')
    const pagesWaiting = pages.filter((p) =>
      [
        'em_producao',
        'em_revisao_interna',
        'aguardando_aprovacao_corretor',
        'aguardando_pagamento',
        'ajustes_solicitados',
      ].includes(p.status)
    )
    const aiIssues = ais.filter((a) => a.status === 'com_falha' || a.status === 'pausado')
    return { delinquent, pagesWaiting, aiIssues }
  }, [subs, pages, ais])

  const monthlySeries = useMemo(
    () => buildMonthlySeries(period, invoices, subs),
    [period, invoices, subs]
  )
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const revenueThisMonth = invoices
    .filter(
      (invoice) =>
        invoice.status === 'aprovado' && getMonthKey(invoice.paidAt) === currentMonthKey
    )
    .reduce((total, invoice) => total + invoice.amount, 0)
  const activeSubscriptions = subs.filter((subscription) => subscription.status === 'ativa')
  const estimatedMrr = activeSubscriptions.reduce((total, subscription) => {
    const plan = plans.find((item) => item.id === subscription.planId)
    const planMonthlyValue = plan
      ? subscription.billingCycle === 'anual'
        ? plan.yearlyPrice / 12
        : plan.monthlyPrice
      : 0
    const addonsMonthlyValue = subscription.addons
      .filter((addon) => addon.active && addon.billing === 'mensal')
      .reduce((sum, addon) => sum + addon.price, 0)
    return total + planMonthlyValue + addonsMonthlyValue
  }, 0)
  const attentionCount =
    attention.delinquent.length +
    attention.pagesWaiting.length +
    attention.aiIssues.length +
    ticketOpen +
    requestsPending

  if (!allowed) return null

  return (
    <div className="admin-dashboard min-h-full bg-slate-50 text-slate-900">
      <Breadcrumbs items={[{ label: 'Admin', href: '/paineladmin' }, { label: 'Centro de controle' }]} />
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-7">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Visão geral
                </span>
                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                  Ambiente de demonstração
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                Centro de controle
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Acompanhe receita, assinaturas e pendências. Use os atalhos para administrar cada área da plataforma.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs text-slate-400">
                {lastUpdated
                  ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Carregando dados'}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={refreshDashboard}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Atualizar
              </Button>
              <Link href="/admin/realtors">
                <Button size="sm">
                  <UsersRound className="h-3.5 w-3.5" />
                  Gerir corretores
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-slate-100 px-5 py-3 md:px-7">
            <p className="text-xs text-slate-500">
              Os indicadores refletem os dados disponíveis neste navegador. A receita considera apenas faturas confirmadas; valores de planos podem ser provisórios.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat
            title="Receita confirmada no mês"
            value={formatCurrency(revenueThisMonth)}
            detail="Total de faturas pagas neste mês"
            icon={<CircleDollarSign className="h-5 w-5" />}
            href="/admin/financeiro"
            tone="green"
          />
          <DashboardStat
            title="Receita recorrente estimada"
            value={formatCurrency(estimatedMrr)}
            detail={`${activeSubscriptions.length} assinaturas ativas · valores de plano provisórios`}
            icon={<CreditCard className="h-5 w-5" />}
            href="/admin/assinaturas"
            tone="blue"
          />
          <DashboardStat
            title="Corretores cadastrados"
            value={realtorsList.length}
            detail={`${realtorsList.filter((realtor) => realtor.status === 'active').length} ativos na base de demonstração`}
            icon={<UsersRound className="h-5 w-5" />}
            href="/admin/corretores"
          />
          <DashboardStat
            title="Itens para acompanhar"
            value={attentionCount}
            detail={`${ticketOpen} chamados · ${requestsPending} solicitações`}
            icon={<Headset className="h-5 w-5" />}
            href="/admin/solicitacoes"
            tone={attentionCount > 0 ? 'rose' : 'green'}
          />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Acesso rápido à gestão</h2>
              <p className="mt-1 text-sm text-slate-500">
                Atalhos para os principais controles da plataforma.
              </p>
            </div>
            <span className="text-xs text-slate-400">{moduleDefs.length} áreas principais</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {moduleDefs.map((mod) => {
              const metaByHref: Record<string, string> = {
                '/admin/realtors': `${realtorsList.filter((r) => r.status === 'active').length} ativos`,
                '/admin/professional': `${pages.length} em fluxo · ${publishedPages} publicadas`,
                '/admin/ai': `${ais.length} integrações`,
                '/admin/subscriptions': `${subs.length} assinaturas`,
                '/admin/properties': `${propertiesList.length} imóveis demo`,
                '/admin/support': `${ticketOpen} abertos`,
                '/admin/requests': `${requestsPending} na fila`,
                '/admin/financial': `${formatCurrency(revenueThisMonth)} no mês`,
                '/admin/users': 'Gestão de contas',
                '/admin/communication': 'Central de comunicados',
                '/admin/reports': 'Indicadores globais',
                '/admin/security/2fa': 'Proteção da conta admin',
              }
              const iconByHref: Record<string, React.ReactNode> = {
                '/admin/realtors': <UsersRound className="h-4 w-4" />,
                '/admin/professional': <Globe2 className="h-4 w-4" />,
                '/admin/ai': <Bot className="h-4 w-4" />,
                '/admin/subscriptions': <CreditCard className="h-4 w-4" />,
                '/admin/properties': <Building2 className="h-4 w-4" />,
                '/admin/support': <Headset className="h-4 w-4" />,
                '/admin/requests': <FileCheck2 className="h-4 w-4" />,
                '/admin/financial': <CircleDollarSign className="h-4 w-4" />,
                '/admin/users': <UsersRound className="h-4 w-4" />,
                '/admin/communication': <Megaphone className="h-4 w-4" />,
                '/admin/reports': <ScrollText className="h-4 w-4" />,
                '/admin/security/2fa': <ShieldCheck className="h-4 w-4" />,
              }

              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-300 hover:bg-amber-50/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800">
                      {iconByHref[mod.href]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-amber-700" />
                  </div>
                  <p className="mt-4 font-semibold text-slate-900">{mod.title}</p>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{mod.description}</p>
                  <p className="mt-3 text-xs font-medium text-amber-800">{metaByHref[mod.href]}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {(attention.pagesWaiting.length > 0 ||
          attention.delinquent.length > 0 ||
          attention.aiIssues.length > 0 ||
          ticketOpen > 0 ||
          requestsPending > 0) && (
          <section className="rounded-xl border border-warning/30 bg-warning/5 p-5">
            <h2 className="mb-3 font-semibold text-foreground">Precisa da sua atenção</h2>
            <div className="grid gap-3 lg:grid-cols-5">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Páginas profissionais ({attention.pagesWaiting.length})
                </p>
                <ul className="space-y-2">
                  {attention.pagesWaiting.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{p.realtorName}</span>
                      <Link href={`/admin/professional/${p.id}`}>
                        <Badge variant="warning">
                          {professionalStatusLabels[p.status as ProfessionalRequestStatus]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                  {attention.pagesWaiting.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Nenhuma pendência</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Assinaturas ({attention.delinquent.length})
                </p>
                <ul className="space-y-2">
                  {attention.delinquent.slice(0, 4).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{s.realtorName}</span>
                      <Link href={`/admin/subscriptions/${s.id}`}>
                        <Badge variant="destructive">{subscriptionStatusLabels[s.status]}</Badge>
                      </Link>
                    </li>
                  ))}
                  {attention.delinquent.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Nenhuma pendência</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  IA com alerta ({attention.aiIssues.length})
                </p>
                <ul className="space-y-2">
                  {attention.aiIssues.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{a.realtorName}</span>
                      <Link href={`/admin/ai/${a.id}`}>
                        <Badge variant="warning">{aiStatusLabels[a.status]}</Badge>
                      </Link>
                    </li>
                  ))}
                  {attention.aiIssues.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Nenhuma pendência</li>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Suporte ({ticketOpen})</p>
                <Link href="/admin/suporte" className="text-sm text-muted-foreground hover:text-foreground">
                  {ticketOpen > 0 ? 'Ver chamados abertos' : 'Nenhum chamado aberto'}
                  {ticketOpen > 0 ? ' →' : ''}
                </Link>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Solicitações ({requestsPending})
                </p>
                <Link
                  href="/admin/solicitacoes"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {requestsPending > 0 ? 'Revisar solicitações' : 'Nenhuma solicitação pendente'}
                  {requestsPending > 0 ? ' →' : ''}
                </Link>
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Corretores</h2>
              <Link href="/admin/realtors">
                <Button size="sm" variant="outline">
                  Ver todos
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {realtorsList.slice(0, 5).map((r) => {
                const profile = publicRealtorProfiles.find((p) => p.id === r.id)
                const page = pages.find((p) => p.realtorId === r.id)
                const ai = ais.find((a) => a.realtorId === r.id)
                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{r.name}</p>
                        <Badge variant={r.status === 'active' ? 'success' : 'secondary'}>
                          {r.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge variant="primary">{labelPt(planNameLabels, r.plan)}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Página: {page ? professionalStatusLabels[page.status] : 'Não contratada'}
                        {' · '}
                        IA: {ai ? aiStatusLabels[ai.status] : 'Não contratada'}
                        {profile ? ` · /corretor/${profile.slug}` : ''}
                      </p>
                    </div>
                    <Link href={`/admin/realtors/${r.id}`}>
                      <Button size="sm">Abrir ficha</Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Páginas profissionais recentes</h2>
              <Link href="/admin/professional">
                <Button size="sm" variant="outline">
                  Produção
                </Button>
              </Link>
            </div>
            {pages.length === 0 ? (
              <div className="space-y-3">
                {publicRealtorProfiles.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">/corretor/{p.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="success">Publicada</Badge>
                      <Link href={`/corretor/${p.slug}`}>
                        <Button size="sm" variant="outline">
                          Vitrine
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pages.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{p.realtorName}</p>
                      <p className="text-xs text-muted-foreground">
                        /corretor/{p.form.slug} · {professionalStatusLabels[p.status]}
                      </p>
                    </div>
                    <Link href={`/admin/professional/${p.id}`}>
                      <Button size="sm">Gerir página</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-4 w-4 text-amber-700" />
                  <h2 className="font-semibold text-slate-900">Receita confirmada</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">Faturas SaaS com pagamento aprovado</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                {([6, 12] as const).map((months) => (
                  <button
                    key={months}
                    type="button"
                    aria-pressed={period === months}
                    onClick={() => setPeriod(months)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                      period === months
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {months} meses
                  </button>
                ))}
              </div>
            </div>
            <RevenueChart data={monthlySeries} />
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Receita confirmada neste mês</span>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(revenueThisMonth)}</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-sky-700" />
                  <h2 className="font-semibold text-slate-900">Novas assinaturas</h2>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Planos iniciados por mês · período de {period} meses
                </p>
              </div>
              <Link
                href="/admin/assinaturas"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-800 hover:text-sky-950"
              >
                Ver planos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <SubscriptionChart data={monthlySeries} />
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">Assinaturas ativas</span>
              <span className="text-sm font-semibold text-slate-900">{activeSubscriptions.length}</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-900">Distribuição dos planos ativos</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Visão da base de assinaturas cadastrada neste navegador
                </p>
              </div>
              <Link href="/admin/assinaturas">
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                  Administrar planos
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan, index) => {
                const count = activeSubscriptions.filter(
                  (subscription) => subscription.planId === plan.id
                ).length
                const total = Math.max(activeSubscriptions.length, 1)
                const barColors = ['bg-amber-500', 'bg-sky-500', 'bg-emerald-500']
                return (
                  <div key={plan.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700">{plan.name.replace('Plano ', '')}</p>
                      <span className="text-lg font-semibold text-slate-950">{count}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${barColors[index % barColors.length]}`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatCurrency(plan.monthlyPrice)} / mês
                      {plan.provisional ? ' · valor provisório' : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
