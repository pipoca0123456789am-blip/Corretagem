'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin, isSupportAgent } from '@/lib/auth'
import {
  AnalyticsState,
  ComparisonBarChart,
  ExportPrintBar,
  GoalsPanel,
  HorizontalBars,
  InsightsPanel,
  RankingList,
  ReportFilters,
  ReportTable,
  SectionTabs,
  SuccessNote,
  SummaryMetric,
  useAnalyticsLoad,
} from '@/components/analytics/shared'
import {
  ReportPeriod,
  ReportStatusFilter,
  filterTableRows,
  getAdminReport,
  periodLabels,
} from '@/lib/phase17-data'

const tabs = [
  { id: 'financeiro', label: 'Receita e planos' },
  { id: 'crescimento', label: 'Crescimento' },
  { id: 'addons', label: 'Add-ons e IA' },
  { id: 'operacao', label: 'Operação e suporte' },
]

export default function AdminReportsPage() {
  const router = useRouter()
  const { state, reload } = useAnalyticsLoad()
  const [allowed, setAllowed] = useState(false)
  const [period, setPeriod] = useState<ReportPeriod>('30d')
  const [status, setStatus] = useState<ReportStatusFilter>('all')
  const [tab, setTab] = useState('financeiro')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isSuperAdmin() && !isSupportAgent()) {
      router.replace('/reports')
      return
    }
    setAllowed(true)
  }, [router])

  const report = useMemo(() => {
    if (state !== 'ready') return null
    return getAdminReport(period)
  }, [period, state])

  if (!allowed) return null

  const planosRows = filterTableRows(report?.tables.planos || [], status)
  const corretoresRows = filterTableRows(report?.tables.corretores || [], status)
  const financeiroRows = filterTableRows(report?.tables.financeiro || [], status)
  const suporteRows = filterTableRows(report?.tables.suporte || [], status)

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Relatórios' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6 print:p-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Relatórios da plataforma</h1>
            <p className="text-sm text-muted-foreground">
              Visão global do Super Admin · {periodLabels[period]}
            </p>
          </div>
          <ExportPrintBar
            title="Relatório da plataforma — ImóvelHub"
            onExported={(msg) => setSuccess(msg)}
          />
        </div>

        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        <Alert
          variant="info"
          description="Dados fictícios em R$. Preços de planos mensais são provisórios. Página profissional R$ 497 e IA R$ 97 (sugerido) preservados."
        />

        <ReportFilters
          period={period}
          status={status}
          onPeriod={(p) => {
            setPeriod(p)
            reload()
          }}
          onStatus={setStatus}
          onReload={reload}
        />

        <SectionTabs tabs={tabs} active={tab} onChange={setTab} />

        <AnalyticsState state={state} onRetry={reload}>
          {!report ? null : (
            <>
              {tab === 'financeiro' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Receita" value={report.summary.receita} delta={report.deltas.receita} unit="currency" description="Total da plataforma no período" />
                    <SummaryMetric title="Receita recorrente (MRR)" value={report.summary.receitaRecorrente} delta={report.deltas.receitaRecorrente} unit="currency" description="Assinaturas ativas" />
                    <SummaryMetric title="Assinaturas" value={report.summary.assinaturas} delta={report.deltas.assinaturas} description="Contas pagantes/trial" />
                    <SummaryMetric title="Planos ativos" value={report.summary.planosAtivos} delta={report.deltas.planosAtivos} description="Catálogo comercial" />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ComparisonBarChart title="Receita — atual vs anterior" data={report.series.receita} unit="currency" />
                    <HorizontalBars title="Corretores por plano (%)" data={report.planosDistribuicao} unit="percent" />
                  </div>
                  <ReportTable title="Planos" rows={planosRows} valueLabel="Preço" />
                  <ReportTable title="Financeiro" rows={financeiroRows} valueLabel="Valor" />
                </div>
              ) : null}

              {tab === 'crescimento' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Crescimento" value={report.summary.crescimento} delta={report.deltas.crescimento} unit="percent" description="Variação de base ativa" />
                    <SummaryMetric title="Testes" value={report.summary.testes} delta={report.deltas.testes} description="Trials iniciados" />
                    <SummaryMetric title="Upgrades" value={report.summary.upgrades} delta={report.deltas.upgrades} description="Mudanças para plano superior" />
                    <SummaryMetric title="Downgrades" value={report.summary.downgrades} delta={report.deltas.downgrades} description="Mudanças para plano inferior" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Inadimplência" value={report.summary.inadimplencia} delta={report.deltas.inadimplencia} description="Assinaturas em atraso" />
                    <SummaryMetric title="Cancelamentos" value={report.summary.cancelamentos} delta={report.deltas.cancelamentos} description="Contas encerradas" />
                    <SummaryMetric title="Corretores ativos" value={report.summary.corretoresAtivos} delta={report.deltas.corretoresAtivos} description="Usuários operando" />
                    <SummaryMetric title="Leads da plataforma" value={report.summary.leadsPlataforma} delta={report.deltas.leadsPlataforma} description="Soma das carteiras" />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ComparisonBarChart title="Assinaturas — atual vs anterior" data={report.series.assinaturas} />
                    <ComparisonBarChart title="Corretores — atual vs anterior" data={report.series.corretores} />
                  </div>
                  <RankingList title="Ranking de corretores (receita)" items={report.rankings} />
                  <GoalsPanel goals={report.goals} />
                  <ReportTable title="Corretores" rows={corretoresRows} valueLabel="Plano / valor" />
                </div>
              ) : null}

              {tab === 'addons' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Páginas profissionais" value={report.summary.paginasProfissionais} delta={report.deltas.paginasProfissionais} description="Vendidas (R$ 497)" />
                    <SummaryMetric title="Integrações de IA" value={report.summary.integracoesIa} delta={report.deltas.integracoesIa} description="Vendidas (R$ 97 sugerido)" />
                    <SummaryMetric title="Consumo da IA" value={report.summary.consumoIa} delta={report.deltas.consumoIa} description="Mensagens/interações" />
                    <SummaryMetric title="Imóveis na plataforma" value={report.summary.imoveis} delta={report.deltas.imoveis} description="Todas as carteiras" />
                  </div>
                  <SummaryMetric title="Clientes" value={report.summary.clientes} delta={report.deltas.clientes} description="Vinculados aos corretores de origem" />
                  <InsightsPanel insights={report.insights.filter((i) => i.id === 'ai3' || i.id === 'ai1')} />
                </div>
              ) : null}

              {tab === 'operacao' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Chamados" value={report.summary.chamados} delta={report.deltas.chamados} description="Volume de suporte" />
                    <SummaryMetric title="Tempo de atendimento" value={report.summary.tempoAtendimentoH} delta={report.deltas.tempoAtendimentoH} description="Horas em média" />
                    <SummaryMetric title="Imóveis" value={report.summary.imoveis} delta={report.deltas.imoveis} description="Base global" />
                    <SummaryMetric title="Clientes" value={report.summary.clientes} delta={report.deltas.clientes} description="Base global" />
                  </div>
                  <ComparisonBarChart title="Chamados — atual vs anterior" data={report.series.chamados} />
                  <InsightsPanel insights={report.insights} />
                  <ReportTable title="Suporte" rows={suporteRows} valueLabel="Qtd / valor" />
                </div>
              ) : null}
            </>
          )}
        </AnalyticsState>
      </div>
    </div>
  )
}
