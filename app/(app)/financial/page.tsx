'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileBarChart,
  Receipt,
  Wallet,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Modal } from '@/components/design-system/feedback/modal'
import { isSuperAdmin } from '@/lib/auth'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import {
  formatCurrency,
  formatDateBR,
  getRealtorFinancialSummary,
  monthlyEvolution,
  commissionStatusBadge,
  commissionStatusLabels,
} from '@/lib/phase8-data'

export default function FinancialDashboardPage() {
  const [realtorId, setRealtorId] = useState<number | null>(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    setRealtorId(getCurrentRealtorId())
    const t = setTimeout(() => {
      try {
        setLoading(false)
      } catch {
        setError(true)
        setLoading(false)
      }
    }, 550)
    return () => clearTimeout(t)
  }, [])

  const summary = useMemo(() => getRealtorFinancialSummary(realtorId), [realtorId])
  const maxChart = Math.max(...monthlyEvolution.map((m) => Math.max(m.receita, m.despesa, m.comissao)))

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Alert
          variant="destructive"
          title="Erro ao carregar financeiro"
          description="Não foi possível carregar seus dados financeiros."
        />
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Financeiro do corretor' }]} />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Financeiro do corretor
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? 'Visão global das finanças individuais dos corretores (não confundir com o financeiro da plataforma)'
                : 'Suas comissões, receitas, despesas e serviços contratados'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setExportOpen(true)}>
              <Download className="w-4 h-4" />
              Exportar visão
            </Button>
            <Link href="/financial/reports">
              <Button variant="primary" className="gap-2">
                <FileBarChart className="w-4 h-4" />
                Relatórios
              </Button>
            </Link>
          </div>
        </div>

        {success && (
          <Alert variant="success" title="Sucesso" description={success} onClose={() => setSuccess('')} />
        )}

        <Alert
          variant="info"
          title="Módulo individual"
          description="Este painel exibe apenas o financeiro pessoal do corretor. O financeiro global da plataforma permanece em Admin → Financeiro."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Comissão prevista" value={formatCurrency(summary.expectedCommission)} description="A receber" />
          <MetricCard title="Comissão recebida" value={formatCurrency(summary.receivedCommission)} description="Acumulado pago" />
          <MetricCard title="Receita do mês" value={formatCurrency(summary.monthRevenue)} description="Julho/2026" />
          <MetricCard title="Receita acumulada" value={formatCurrency(summary.ytdRevenue)} description="Ano até agora" />
          <MetricCard title="Vendas concluídas" value={String(summary.salesClosed)} description="Com comissão ativa/paga" />
          <MetricCard title="Locações concluídas" value={String(summary.rentalsClosed)} description="Intermediações" />
          <MetricCard title="Valores pendentes" value={formatCurrency(summary.pendingValues)} description="Aprovadas / aguardando" />
          <MetricCard title="Despesas do mês" value={formatCurrency(summary.expenses)} description="Julho/2026" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Resultado líquido (mês)"
            value={formatCurrency(summary.netResult)}
            description="Receitas − despesas"
          />
          <MetricCard
            title="Serviços contratados"
            value={formatCurrency(summary.servicesMonthly)}
            description="Custo mensal recorrente"
          />
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-3">Atalhos</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/financial/commissions"><Button size="sm" variant="outline">Comissões</Button></Link>
              <Link href="/financial/revenues"><Button size="sm" variant="outline">Receitas</Button></Link>
              <Link href="/financial/expenses"><Button size="sm" variant="outline">Despesas</Button></Link>
              <Link href="/financial/entries"><Button size="sm" variant="outline">Lançamentos</Button></Link>
              <Link href="/financial/services"><Button size="sm" variant="outline">Serviços</Button></Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6">
            <h2 className="font-semibold text-foreground mb-4">Evolução financeira</h2>
            <div className="h-[220px] flex items-end justify-around gap-2 md:gap-4">
              {monthlyEvolution.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  <div className="w-full flex items-end justify-center gap-0.5 h-[180px]">
                    <div
                      className="bg-primary/80 rounded-t w-2 sm:w-3"
                      style={{ height: `${(item.receita / maxChart) * 170}px` }}
                      title={`Receita ${formatCurrency(item.receita)}`}
                    />
                    <div
                      className="bg-status-available/70 rounded-t w-2 sm:w-3"
                      style={{ height: `${(item.comissao / maxChart) * 170}px` }}
                      title={`Comissão ${formatCurrency(item.comissao)}`}
                    />
                    <div
                      className="bg-destructive/60 rounded-t w-2 sm:w-3"
                      style={{ height: `${(item.despesa / maxChart) * 170}px` }}
                      title={`Despesa ${formatCurrency(item.despesa)}`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary/80" /> Receita</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-status-available/70" /> Comissão</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-destructive/60" /> Despesa</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Próximos pagamentos</h2>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
            {summary.upcomingPayments.length === 0 ? (
              <EmptyState title="Nenhum pagamento" description="Sem vencimentos próximos." />
            ) : (
              <div className="space-y-3">
                {summary.upcomingPayments.slice(0, 6).map((pay) => (
                  <div key={pay.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pay.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateBR(pay.dueDate)}
                        {isAdmin ? ` · ${pay.realtorName}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(pay.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/financial/services">
              <Button variant="outline" size="sm" className="w-full">Ver serviços</Button>
            </Link>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="font-semibold text-foreground">Comissões recentes</h2>
            <Link href="/financial/commissions">
              <Button size="sm" variant="outline">Ver todas</Button>
            </Link>
          </div>
          {summary.commissions.length === 0 ? (
            <EmptyState
              icon={<Receipt className="w-8 h-8" />}
              title="Sem comissões"
              description="Nenhuma comissão encontrada na sua carteira."
            />
          ) : (
            <div className="space-y-3">
              {summary.commissions.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  href={`/financial/commissions/${c.id}`}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{c.code}</p>
                      <Badge variant={commissionStatusBadge(c.status)}>
                        {commissionStatusLabels[c.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {c.propertyTitle} · {c.clientName}
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    <p className="font-semibold text-foreground flex items-center gap-1 justify-end">
                      {c.status === 'paga' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-status-available" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-status-pending" />
                      )}
                      {formatCurrency(c.commissionValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">Previsto {formatDateBR(c.expectedDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exportação visual"
        description="Simulação de exportação do painel financeiro"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setExportOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setExportOpen(false)
                setSuccess('Exportação visual gerada (simulada). Nenhum arquivo foi baixado.')
                setTimeout(() => setSuccess(''), 3500)
              }}
            >
              Confirmar exportação
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Esta ação não realiza download real. Em produção, geraria PDF/CSV do resumo financeiro.
        </p>
      </Modal>
    </div>
  )
}
