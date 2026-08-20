'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { adminMetrics, chartData, propertiesList, realtorsList } from '@/lib/mock-data'
import { isSuperAdmin } from '@/lib/auth'
import { labelPt, planNameLabels } from '@/lib/labels-pt'
import {
  getAllProfessionalRequests,
  professionalStatusLabels,
  type ProfessionalRequestStatus,
} from '@/lib/phase12-data'
import { getAllAiIntegrations, aiStatusLabels } from '@/lib/phase13-data'
import { loadSubscriptions, subscriptionStatusLabels } from '@/lib/phase14-data'
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
] as const

export default function AdminDashboard() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [pages, setPages] = useState<ReturnType<typeof getAllProfessionalRequests>>([])
  const [ais, setAis] = useState<ReturnType<typeof getAllAiIntegrations>>([])
  const [subs, setSubs] = useState<ReturnType<typeof loadSubscriptions>>([])
  const [ticketOpen, setTicketOpen] = useState(0)
  const [requestsPending, setRequestsPending] = useState(0)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    const professional = getAllProfessionalRequests()
    const ai = getAllAiIntegrations()
    const subscriptions = loadSubscriptions()
    const tickets = loadTickets()
    const requests = loadRequests()
    setPages(professional)
    setAis(ai)
    setSubs(subscriptions)
    setTicketOpen(supportReportMetrics(tickets).open)
    setRequestsPending(
      requests.filter((r) => !['concluida', 'recusada', 'cancelada'].includes(r.status)).length
    )
  }, [router])

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

  if (!allowed) return null

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Centro de controle' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Super Admin</p>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Centro de controle da plataforma</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Visão global para gerir corretores, páginas profissionais, IA, assinaturas e suporte —
              diferente do painel operacional do corretor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/realtors">
              <Button size="sm">Gerir corretores</Button>
            </Link>
            <Link href="/admin/professional">
              <Button size="sm" variant="outline">
                Páginas profissionais
              </Button>
            </Link>
            <Link href="/admin/subscriptions">
              <Button size="sm" variant="outline">
                Assinaturas
              </Button>
            </Link>
          </div>
        </div>

        <Alert
          variant="info"
          title="Painel exclusivo da operação ImóvelHub"
          description="Aqui você administra a plataforma. Cada corretor continua com a própria carteira isolada no painel dele."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Receita da plataforma"
            value={adminMetrics.revenue.total}
            description={`Mês: ${adminMetrics.revenue.mtd}`}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="Corretores ativos"
            value={realtorsList.filter((r) => r.status === 'active').length}
            description={`${realtorsList.length} cadastrados na demo`}
          />
          <MetricCard
            title="Assinaturas ativas"
            value={subs.filter((s) => s.status === 'ativa' || s.status === 'trial').length}
            description={`${attention.delinquent.length} pedem atenção`}
          />
          <MetricCard
            title="Chamados abertos"
            value={ticketOpen}
            description={`${requestsPending} solicitações na fila`}
          />
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Módulos de gestão</h2>
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
                '/admin/financial': adminMetrics.revenue.mtd,
              }

              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <p className="font-semibold text-foreground">{mod.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
                  <p className="mt-3 text-xs font-medium text-primary">{metaByHref[mod.href]}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {(attention.pagesWaiting.length > 0 ||
          attention.delinquent.length > 0 ||
          attention.aiIssues.length > 0) && (
          <section className="rounded-xl border border-warning/30 bg-warning/5 p-5">
            <h2 className="mb-3 font-semibold text-foreground">Precisa da sua atenção</h2>
            <div className="grid gap-3 lg:grid-cols-3">
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
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold text-foreground">Receita mensal (demo)</h2>
            <div className="flex h-[200px] items-end justify-around gap-2">
              {chartData.revenue.map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-2">
                  <div
                    className="min-w-[28px] rounded-t bg-primary/70"
                    style={{ height: `${(item.value / 70000) * 180}px`, width: '100%' }}
                    title={`R$ ${item.value.toLocaleString('pt-BR')}`}
                  />
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold text-foreground">Distribuição de planos</h2>
            <div className="space-y-3">
              {[
                { label: 'Inicial', value: realtorsList.filter((r) => r.plan === 'starter').length },
                {
                  label: 'Profissional',
                  value: realtorsList.filter((r) => r.plan === 'professional').length,
                },
                { label: 'Premium', value: subs.filter((s) => s.planId === 'premium').length },
              ].map((plan) => (
                <div key={plan.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-foreground">{plan.label}</span>
                    <span className="text-muted-foreground">{plan.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max(8, (plan.value / Math.max(realtorsList.length, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
