'use client'

import { useEffect, useMemo, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin } from '@/lib/auth'
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
  getRealtorReport,
  periodLabels,
  scopedRealtorId,
} from '@/lib/phase17-data'

const tabs = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'imoveis', label: 'Imóveis' },
  { id: 'leads', label: 'Leads e conversão' },
  { id: 'vendas', label: 'Vendas e financeiro' },
  { id: 'digital', label: 'Páginas, IA e campanhas' },
]

export default function RealtorReportsPage() {
  const { state, reload } = useAnalyticsLoad()
  const [period, setPeriod] = useState<ReportPeriod>('30d')
  const [status, setStatus] = useState<ReportStatusFilter>('all')
  const [tab, setTab] = useState('resumo')
  const [success, setSuccess] = useState('')
  const [adminNote, setAdminNote] = useState(false)

  useEffect(() => {
    setAdminNote(isSuperAdmin())
  }, [])

  const report = useMemo(() => {
    if (state !== 'ready') return null
    return getRealtorReport(period, scopedRealtorId())
  }, [period, state])

  const imoveisRows = filterTableRows(report?.tables.imoveis || [], status)
  const leadsRows = filterTableRows(report?.tables.leads || [], status)
  const vendasRows = filterTableRows(report?.tables.vendas || [], status)
  const campanhasRows = filterTableRows(report?.tables.campanhas || [], status)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Relatórios' }]} />
      <div className="space-y-6 p-4 md:p-6 print:p-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Relatórios e analytics</h1>
            <p className="text-sm text-muted-foreground">
              Desempenho da sua carteira · {periodLabels[period]}
              {report ? ` · ${report.realtorName}` : ''}
            </p>
          </div>
          <ExportPrintBar
            title="Relatório do corretor — ImóvelHub"
            onExported={(msg) => setSuccess(msg)}
          />
        </div>

        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        {adminNote ? (
          <Alert
            variant="info"
            description="Você está no Super Admin. Este painel mostra a visão individual do corretor (demo). A visão global está em Relatórios do Admin."
          />
        ) : (
          <Alert
            variant="info"
            description="Métricas fictícias com comparação ao período anterior. Exportação e impressão são apenas visuais."
          />
        )}

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
              {tab === 'resumo' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Leads" value={report.summary.leads} delta={report.deltas.leads} description="Novos contatos no período" />
                    <SummaryMetric title="Conversão" value={report.summary.conversao} delta={report.deltas.conversao} unit="percent" description="Leads que avançaram no funil" />
                    <SummaryMetric title="Receita" value={report.summary.receita} delta={report.deltas.receita} unit="currency" description="Inclui comissões e locações" />
                    <SummaryMetric title="Visitas" value={report.summary.visitas} delta={report.deltas.visitas} description="Visitas realizadas/agendadas" />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <ComparisonBarChart title="Leads — atual vs anterior" data={report.series.leads} />
                    <ComparisonBarChart title="Receita — atual vs anterior" data={report.series.receita} unit="currency" />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <GoalsPanel goals={report.goals} />
                    <InsightsPanel insights={report.insights} />
                  </div>
                </div>
              ) : null}

              {tab === 'imoveis' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Cadastrados" value={report.summary.imoveisCadastrados} delta={report.deltas.imoveisCadastrados} description="Total na carteira" />
                    <SummaryMetric title="Publicados" value={report.summary.imoveisPublicados} delta={report.deltas.imoveisPublicados} description="Visíveis na vitrine" />
                    <SummaryMetric title="Vendidos" value={report.summary.imoveisVendidos} delta={report.deltas.imoveisVendidos} description="Negócios concluídos" />
                    <SummaryMetric title="Alugados" value={report.summary.imoveisAlugados} delta={report.deltas.imoveisAlugados} description="Contratos de locação" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Visualizações" value={report.summary.visualizacoes} delta={report.deltas.visualizacoes} description="Páginas de imóvel" />
                    <SummaryMetric title="Cliques" value={report.summary.cliques} delta={report.deltas.cliques} description="CTAs e contatos" />
                    <SummaryMetric title="Favoritos" value={report.summary.favoritos} delta={report.deltas.favoritos} description="Salvos por clientes" />
                    <SummaryMetric title="Compartilhamentos" value={report.summary.compartilhamentos} delta={report.deltas.compartilhamentos} description="Links compartilhados" />
                  </div>
                  <ComparisonBarChart title="Visualizações — atual vs anterior" data={report.series.visualizacoes} />
                  <RankingList title="Ranking de imóveis" items={report.rankings} />
                  <ReportTable title="Imóveis do período" rows={imoveisRows} valueLabel="Visualizações" />
                </div>
              ) : null}

              {tab === 'leads' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Leads" value={report.summary.leads} delta={report.deltas.leads} description="Volume no período" />
                    <SummaryMetric title="Conversão" value={report.summary.conversao} delta={report.deltas.conversao} unit="percent" description="Qualidade do funil" />
                    <SummaryMetric title="Tempo de resposta" value={report.summary.tempoRespostaMin} delta={report.deltas.tempoRespostaMin} description="Minutos em média" />
                    <SummaryMetric title="Propostas" value={report.summary.propostas} delta={report.deltas.propostas} description="Propostas enviadas" />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <HorizontalBars title="Origem dos leads (%)" data={report.leadOrigins} unit="percent" />
                    <ComparisonBarChart title="Visitas — atual vs anterior" data={report.series.visitas} />
                  </div>
                  <ReportTable title="Leads recentes" rows={leadsRows} valueLabel="Qtd" />
                </div>
              ) : null}

              {tab === 'vendas' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Negociações" value={report.summary.negociacoes} delta={report.deltas.negociacoes} description="Em andamento/concluídas" />
                    <SummaryMetric title="Vendas" value={report.summary.vendas} delta={report.deltas.vendas} description="Unidades vendidas" />
                    <SummaryMetric title="Locações" value={report.summary.locacoes} delta={report.deltas.locacoes} description="Contratos de aluguel" />
                    <SummaryMetric title="Comissões" value={report.summary.comissoes} delta={report.deltas.comissoes} unit="currency" description="Recebido/a receber" />
                  </div>
                  <SummaryMetric title="Receita total" value={report.summary.receita} delta={report.deltas.receita} unit="currency" description="Contexto: comissões + locações no período" />
                  <ComparisonBarChart title="Receita — atual vs anterior" data={report.series.receita} unit="currency" />
                  <GoalsPanel goals={report.goals.filter((g) => g.unit === 'currency' || g.label.includes('Visitas'))} />
                  <ReportTable title="Vendas e locações" rows={vendasRows} valueLabel="Valor" />
                </div>
              ) : null}

              {tab === 'digital' ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryMetric title="Campanhas" value={report.summary.campanhas} delta={report.deltas.campanhas} description="Ativas no período" />
                    <SummaryMetric title="Página pública" value={report.summary.paginaPublicaViews} delta={report.deltas.paginaPublicaViews} description="Visualizações" />
                    <SummaryMetric title="Página profissional" value={report.summary.paginaProfissionalViews} delta={report.deltas.paginaProfissionalViews} description="Visualizações" />
                    <SummaryMetric title="IA — conversas" value={report.summary.iaConversas} delta={report.deltas.iaConversas} description="Agente isolado" />
                  </div>
                  <SummaryMetric title="WhatsApp — mensagens" value={report.summary.whatsappMensagens} delta={report.deltas.whatsappMensagens} description="Inclui atendimento humano e IA" />
                  <InsightsPanel insights={report.insights} />
                  <ReportTable title="Campanhas" rows={campanhasRows} valueLabel="CTR / valor" />
                </div>
              ) : null}
            </>
          )}
        </AnalyticsState>
      </div>
    </div>
  )
}
