'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Button } from '@/components/design-system/buttons/button'
import { correctorMetrics } from '@/lib/mock-data'

export default function DashboardPage() {
  const quickActions = [
    { label: 'Novo imóvel', href: '/properties/create' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'Agenda', href: '/agenda' },
    { label: 'Visitas', href: '/visitas' },
    { label: 'Negociações', href: '/negociacoes' },
    { label: 'Financeiro', href: '/financeiro' },
  ]

  const activity = [
    { time: '2h', action: 'Novo lead: Ana Souza', href: '/clientes' },
    { time: '4h', action: 'Visita confirmada', href: '/agenda' },
    { time: '1d', action: 'Proposta enviada', href: '/negociacoes' },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel' }]} />
      <div className="space-y-8 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Painel</h1>
          <p className="mt-1 text-sm text-muted-foreground">Resumo da sua operação</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Imóveis ativos"
            value={correctorMetrics.properties.active}
            description={`${correctorMetrics.properties.total} cadastrados`}
          />
          <MetricCard
            title="Vendas"
            value={correctorMetrics.sales.closed}
            description={`Conversão ${correctorMetrics.sales.conversion}`}
          />
          <MetricCard
            title="Leads"
            value={correctorMetrics.leads.qualified}
            description={`${correctorMetrics.leads.new} novos`}
          />
          <MetricCard
            title="Receita do mês"
            value={correctorMetrics.revenue.thisMonth}
            description={`YTD ${correctorMetrics.revenue.ytd}`}
          />
        </div>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Atalhos</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="rounded-xl border border-border bg-card px-4 py-4 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Atividade</h2>
              <Link href="/clientes">
                <Button variant="outline" size="sm">
                  Ver clientes
                </Button>
              </Link>
            </div>
            <ul className="space-y-2">
              {activity.map((item) => (
                <li key={item.action}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="text-foreground">{item.action}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Próximos passos</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/imoveis" className="font-medium text-foreground hover:underline">
                  Gerenciar imóveis
                </Link>
                {' — '}carteira e anúncios
              </li>
              <li>
                <Link href="/meu-site" className="font-medium text-foreground hover:underline">
                  Meu Site
                </Link>
                {' — '}vitrine e domínio
              </li>
              <li>
                <Link href="/assinatura" className="font-medium text-foreground hover:underline">
                  Assinatura
                </Link>
                {' — '}plano Premium ativo
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
