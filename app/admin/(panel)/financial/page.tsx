'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Alert } from '@/components/design-system/feedback/alert'
import { Button } from '@/components/design-system/buttons/button'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { adminMetrics } from '@/lib/mock-data'

export default function AdminFinancialPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Financeiro da plataforma' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Financeiro da plataforma
          </h1>
          <p className="text-muted-foreground mt-1">
            Receita SaaS, assinaturas e indicadores globais do ImóvelHub
          </p>
        </div>

        <Alert
          variant="info"
          title="Escopo distinto"
          description="Este é o financeiro global da plataforma. Para comissões e finanças individuais dos corretores, use Financeiro corretores."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Receita total" value={adminMetrics.revenue.total} description="Plataforma" />
          <MetricCard title="Receita MTD" value={adminMetrics.revenue.mtd} description={adminMetrics.revenue.growth} />
          <MetricCard title="Assinaturas ativas" value={String(adminMetrics.subscriptions.active)} description={`Churn ${adminMetrics.subscriptions.churn}`} />
          <MetricCard title="Ticket médio deal" value={adminMetrics.performance.avgDealValue} description="Mercado intermediado" />
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-foreground">Financeiro dos corretores</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comissões, despesas pessoais e serviços contratados por corretor
            </p>
          </div>
          <Link href="/financial">
            <Button variant="primary">Abrir financeiro corretores</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
