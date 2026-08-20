'use client'

import { useState } from 'react'
import { Printer, Download, TrendingDown, TrendingUp } from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import {
  GoalItem,
  InsightItem,
  MetricPoint,
  RankItem,
  ReportPeriod,
  ReportStatusFilter,
  SeriesPoint,
  TableRow,
  formatMetricValue,
  goalProgress,
  periodLabels,
  statusFilterLabels,
} from '@/lib/phase17-data'

export function useAnalyticsLoad(delay = 280) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const reload = () => {
    setState('loading')
    window.setTimeout(() => setState('ready'), delay)
  }
  return { state, reload, setState }
}

export function AnalyticsState({
  state,
  onRetry,
  empty,
  children,
}: {
  state: 'loading' | 'ready' | 'error' | 'empty'
  onRetry?: () => void
  empty?: { title: string; description?: string }
  children: React.ReactNode
}) {
  if (state === 'loading') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }
  if (state === 'error') {
    return (
      <EmptyState
        title="Falha ao carregar relatórios"
        description="Tente novamente. Nenhum dado foi enviado a um servidor real."
        action={onRetry ? { label: 'Tentar de novo', onClick: onRetry } : undefined}
      />
    )
  }
  if (state === 'empty' && empty) {
    return <EmptyState title={empty.title} description={empty.description} />
  }
  return <>{children}</>
}

export function ReportFilters({
  period,
  status,
  onPeriod,
  onStatus,
  onReload,
  showStatus = true,
}: {
  period: ReportPeriod
  status: ReportStatusFilter
  onPeriod: (p: ReportPeriod) => void
  onStatus: (s: ReportStatusFilter) => void
  onReload?: () => void
  showStatus?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className={`grid flex-1 gap-3 ${showStatus ? 'md:grid-cols-2' : ''}`}>
        <Select
          label="Período"
          value={period}
          onChange={(e) => onPeriod(e.target.value as ReportPeriod)}
          options={(Object.entries(periodLabels) as [ReportPeriod, string][]).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {showStatus ? (
          <Select
            label="Status"
            value={status}
            onChange={(e) => onStatus(e.target.value as ReportStatusFilter)}
            options={(Object.entries(statusFilterLabels) as [ReportStatusFilter, string][]).map(
              ([value, label]) => ({ value, label })
            )}
          />
        ) : null}
      </div>
      {onReload ? (
        <Button variant="outline" onClick={onReload}>
          Atualizar
        </Button>
      ) : null}
    </div>
  )
}

export function ExportPrintBar({
  title,
  onExported,
}: {
  title: string
  onExported?: (msg: string) => void
}) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onExported?.('Exportação visual simulada — nenhum arquivo real foi gerado.')
        }}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar visual
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          document.title = title
          window.print()
        }}
      >
        <Printer className="mr-2 h-4 w-4" />
        Imprimir visual
      </Button>
    </div>
  )
}

export function DeltaBadge({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        up ? 'text-status-available' : 'text-destructive'
      }`}
    >
      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
      {up ? '+' : ''}
      {value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% vs período anterior
    </span>
  )
}

export function SummaryMetric({
  title,
  value,
  delta,
  description,
  unit = 'number',
}: {
  title: string
  value: number
  delta?: number
  description?: string
  unit?: 'currency' | 'number' | 'percent'
}) {
  return (
    <MetricCard
      title={title}
      value={formatMetricValue(value, unit)}
      description={description}
      trend={
        typeof delta === 'number'
          ? { value: Math.abs(delta), isPositive: delta >= 0 }
          : undefined
      }
    />
  )
}

export function ComparisonBarChart({
  title,
  data,
  unit = 'number',
  legendAtual = 'Período atual',
  legendAnterior = 'Período anterior',
}: {
  title: string
  data: SeriesPoint[]
  unit?: 'currency' | 'number' | 'percent'
  legendAtual?: string
  legendAnterior?: string
}) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <EmptyState title="Sem dados" description="Não há série para o período selecionado." />
      </div>
    )
  }
  const max = Math.max(...data.flatMap((d) => [d.atual, d.anterior]), 1)
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
      <div className="flex h-[220px] items-end justify-around gap-2 md:gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-[180px] w-full items-end justify-center gap-1">
              <div
                className="w-2 rounded-t bg-primary sm:w-3"
                style={{ height: `${(item.atual / max) * 170}px` }}
                title={`${legendAtual}: ${formatMetricValue(item.atual, unit)}`}
              />
              <div
                className="w-2 rounded-t bg-muted-foreground/35 sm:w-3"
                style={{ height: `${(item.anterior / max) * 170}px` }}
                title={`${legendAnterior}: ${formatMetricValue(item.anterior, unit)}`}
              />
            </div>
            <span className="truncate text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-primary" /> {legendAtual}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-muted-foreground/35" /> {legendAnterior}
        </span>
      </div>
    </div>
  )
}

export function HorizontalBars({
  title,
  data,
  unit = 'percent',
}: {
  title: string
  data: MetricPoint[]
  unit?: 'currency' | 'number' | 'percent'
}) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">{title}</h3>
        <EmptyState title="Sem dados" description="Nenhuma distribuição disponível." />
      </div>
    )
  }
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{formatMetricValue(item.value, unit)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RankingList({ title, items }: { title: string; items: RankItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold">{title}</h3>
        <EmptyState title="Sem ranking" description="Não há itens para ranquear neste filtro." />
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
      <ol className="space-y-3">
        {items.map((item, idx) => (
          <li key={item.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                {item.name}
              </p>
              {item.meta ? <p className="text-xs text-muted-foreground">{item.meta}</p> : null}
            </div>
            <p className="shrink-0 text-sm font-semibold text-foreground">
              {formatMetricValue(item.value, item.unit || 'number')}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function GoalsPanel({ goals }: { goals: GoalItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <h3 className="mb-4 font-semibold text-foreground">Metas do período</h3>
      <div className="space-y-4">
        {goals.map((g) => {
          const pct = goalProgress(g)
          return (
            <div key={g.id}>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-foreground">{g.label}</span>
                <span className="text-muted-foreground">
                  {formatMetricValue(g.current, g.unit)} / {formatMetricValue(g.target, g.unit)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${pct >= 100 ? 'bg-status-available' : 'bg-primary'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{pct}% da meta</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function InsightsPanel({ insights }: { insights: InsightItem[] }) {
  const variant = {
    positivo: 'success' as const,
    atencao: 'warning' as const,
    neutro: 'info' as const,
  }
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Insights automáticos (simulados)</h3>
      {insights.map((i) => (
        <Alert key={i.id} variant={variant[i.tone]} title={i.title} description={i.text} />
      ))}
    </div>
  )
}

export function ReportTable({
  title,
  rows,
  valueLabel = 'Valor',
}: {
  title: string
  rows: TableRow[]
  valueLabel?: string
}) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 font-semibold">{title}</h3>
        <EmptyState title="Sem dados" description="Nenhum registro para o status/período selecionado." />
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Detalhe</th>
              <th className="px-4 py-3 font-medium">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 text-foreground">{r.label}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{r.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.secondary || '—'}</td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {formatMetricValue(r.value, r.unit || 'number')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SectionTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Button
          key={t.id}
          size="sm"
          variant={active === t.id ? 'primary' : 'outline'}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  )
}

export function SuccessNote({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert className="mb-2" variant="success" description={message} onClose={onClose} />
}
