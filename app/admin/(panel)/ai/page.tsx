'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { isSuperAdmin } from '@/lib/auth'
import { AiPageState, AiStatusBadge, useAiLoad } from '@/components/ai-agent/shared'
import {
  AI_INTEGRATION_PRICE,
  AiIntegration,
  aiStatusLabels,
  formatCurrency,
  getAllAiIntegrations,
} from '@/lib/phase13-data'

export default function AdminAiPage() {
  const router = useRouter()
  const { state, reload } = useAiLoad()
  const [allowed, setAllowed] = useState(false)
  const [list, setList] = useState<AiIntegration[]>([])
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setList(getAllAiIntegrations())
  }, [router, state])

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchStatus = status === 'all' || item.status === status
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        item.realtorName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.config.name.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [list, status, search])

  const connected = list.filter((i) => i.whatsappConnected).length
  const active = list.filter((i) => i.status === 'ativo').length
  const failures = list.filter((i) => i.status === 'com_falha' || i.alerts.some((a) => !a.resolved)).length
  const billing = list.filter((i) => i.paymentStatus === 'confirmado').length * AI_INTEGRATION_PRICE

  if (!allowed) return null

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Agentes de IA' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Agentes de IA — visão global</h1>
          <p className="text-sm text-muted-foreground">
            Solicitações, WhatsApps, consumo e faturamento · {formatCurrency(AI_INTEGRATION_PRICE)} provisório
          </p>
        </div>

        <Alert
          variant="info"
          title="Isolamento preservado"
          description="A visão é global, mas cada agente continua restrito à carteira do seu corretor."
        />

        <AiPageState state={state} onRetry={reload}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Agentes" value={list.length} />
            <MetricCard title="WhatsApps conectados" value={connected} />
            <MetricCard title="Ativos" value={active} />
            <MetricCard title="Faturamento simulado" value={formatCurrency(billing)} description={`${failures} com alertas`} />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              placeholder="Buscar corretor, agente ou ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: 'Todos os status' },
                ...Object.entries(aiStatusLabels).map(([value, label]) => ({ value, label })),
              ]}
            />
          </div>

          {filtered.length === 0 ? (
            <AiPageState state="empty" empty={{ title: 'Nenhuma solicitação', description: 'Ajuste os filtros.' }}>
              {null}
            </AiPageState>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.realtorName}</p>
                      <AiStatusBadge status={item.status} />
                      <Badge variant={item.whatsappConnected ? 'success' : 'warning'}>
                        WhatsApp {item.whatsappConnected ? 'ok' : 'pendente'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.config.name} · {formatCurrency(item.price)} · consumo{' '}
                      {item.consumption.messagesUsed}/{item.consumption.messagesLimit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pagamento: {item.paymentStatus}
                      {item.paymentMethod ? ` · ${item.paymentMethod}` : ''}
                    </p>
                  </div>
                  <Link href={`/admin/ai/${item.id}`}>
                    <Button size="sm">Detalhes</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </AiPageState>
      </div>
    </div>
  )
}
