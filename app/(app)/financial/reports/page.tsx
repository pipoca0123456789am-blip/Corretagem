'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Alert } from '@/components/design-system/feedback/alert'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { Progress } from '@/components/design-system/feedback/progress'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import {
  formatCurrency,
  getRealtorFinancialSummary,
  monthlyEvolution,
} from '@/lib/phase8-data'

export default function FinancialReportsPage() {
  const [loading, setLoading] = useState(true)
  const [realtorId, setRealtorId] = useState<number | null>(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    setRealtorId(getCurrentRealtorId())
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const summary = useMemo(() => getRealtorFinancialSummary(realtorId), [realtorId])
  const maxRevenue = Math.max(...monthlyEvolution.map((m) => m.receita))
  const conversion =
    summary.expectedCommission + summary.receivedCommission > 0
      ? Math.round(
          (summary.receivedCommission /
            (summary.expectedCommission + summary.receivedCommission)) *
            100
        )
      : 0

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Financeiro', href: '/financial' },
          { label: 'Relatórios' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Relatórios financeiros
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? 'Indicadores consolidados dos corretores'
                : 'Visão analítica das suas finanças pessoais'}
            </p>
          </div>
          <Button variant="primary" className="gap-2" onClick={() => setExportOpen(true)}>
            <Download className="w-4 h-4" />
            Exportar relatório
          </Button>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Receita do mês" value={formatCurrency(summary.monthRevenue)} />
          <MetricCard title="Resultado líquido" value={formatCurrency(summary.netResult)} />
          <MetricCard title="Comissão recebida" value={formatCurrency(summary.receivedCommission)} />
          <MetricCard title="Pendências" value={formatCurrency(summary.pendingValues)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-4 md:p-6">
            <h2 className="font-semibold text-foreground mb-4">Receita mensal</h2>
            <div className="space-y-3">
              {monthlyEvolution.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.month}</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.receita)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(item.receita / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Indicadores</h2>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taxa de realização de comissões</p>
              <Progress value={conversion} variant="success" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Vendas</p>
                <p className="text-xl font-bold text-foreground mt-1">{summary.salesClosed}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Locações</p>
                <p className="text-xl font-bold text-foreground mt-1">{summary.rentalsClosed}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Despesas mês</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(summary.expenses)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-muted-foreground">Serviços/mês</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(summary.servicesMonthly)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/financial/commissions"><Button size="sm" variant="outline">Comissões</Button></Link>
              <Link href="/financial/entries"><Button size="sm" variant="outline">Lançamentos</Button></Link>
              <Link href="/financial"><Button size="sm" variant="secondary">Painel</Button></Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exportar relatório"
        description="Confirma a geração da exportação visual?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setExportOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setExportOpen(false)
                setSuccess('Relatório exportado visualmente (simulado). Nenhum arquivo real foi gerado.')
                setTimeout(() => setSuccess(''), 3500)
              }}
            >
              Confirmar exportação
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          A exportação real (PDF/CSV) não está habilitada nesta fase.
        </p>
      </Modal>
    </div>
  )
}
