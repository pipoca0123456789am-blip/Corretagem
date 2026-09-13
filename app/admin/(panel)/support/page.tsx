'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { isSuperAdmin, isSupportAgent } from '@/lib/auth'
import {
  PriorityBadge,
  SlaBar,
  SupportState,
  TicketStatusBadge,
  useSupportLoad,
} from '@/components/support/shared'
import {
  SupportTicket,
  TicketPriority,
  TicketStatus,
  getScopedTickets,
  priorityLabels,
  supportAgents,
  supportReportMetrics,
  ticketCategoryLabels,
  ticketStatusLabels,
} from '@/lib/phase16-data'

export default function AdminSupportPage() {
  const router = useRouter()
  const { state, reload } = useSupportLoad()
  const [allowed, setAllowed] = useState(false)
  const [isAgent, setIsAgent] = useState(false)
  const [tab, setTab] = useState<'fila' | 'relatorios'>('fila')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [assignee, setAssignee] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isSuperAdmin() && !isSupportAgent()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setIsAgent(isSupportAgent())
    setTickets(getScopedTickets())
  }, [router, state])

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = status === 'all' || t.status === status
      const matchPriority = priority === 'all' || t.priority === priority
      const matchAssignee =
        assignee === 'all' ||
        (assignee === 'none' && !t.assigneeId) ||
        t.assigneeId === assignee
      const q = search.toLowerCase()
      const matchQ =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.realtorName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      return matchStatus && matchPriority && matchAssignee && matchQ
    })
  }, [tickets, status, priority, assignee, search])

  const metrics = supportReportMetrics(tickets)

  if (!allowed) return null

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: isAgent ? 'Suporte' : 'Admin', href: isAgent ? '/admin/support' : '/paineladmin' },
          { label: 'Suporte' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {isAgent ? 'Fila de atendimento' : 'Central de suporte'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAgent
                ? 'Você vê chamados novos e os atribuídos a você'
                : 'Visão global de chamados, SLA e avaliações'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant={tab === 'fila' ? 'primary' : 'outline'} onClick={() => setTab('fila')}>
              Fila
            </Button>
            <Button
              size="sm"
              variant={tab === 'relatorios' ? 'primary' : 'outline'}
              onClick={() => setTab('relatorios')}
            >
              Relatórios
            </Button>
          </div>
        </div>

        {isAgent ? (
          <Alert
            variant="info"
            description="Perfil de suporte: acesso limitado à fila e aos dados necessários para atendimento."
          />
        ) : null}

        <SupportState state={state} onRetry={reload}>
          {tab === 'relatorios' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Abertos" value={metrics.open} />
              <MetricCard title="Resolvidos/encerrados" value={metrics.resolved} />
              <MetricCard title="Avaliação média" value={metrics.avgRating || '—'} />
              <MetricCard title="SLA estourado" value={metrics.breached} />
              <MetricCard title="Urgentes abertos" value={metrics.byPriority.urgente} />
              <MetricCard title="Alta" value={metrics.byPriority.alta} />
              <MetricCard title="Média" value={metrics.byPriority.media} />
              <MetricCard title="Baixa" value={metrics.byPriority.baixa} />
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Input
                  placeholder="Buscar corretor, assunto ou ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'Status' },
                    ...(Object.entries(ticketStatusLabels) as [TicketStatus, string][]).map(
                      ([value, label]) => ({ value, label })
                    ),
                  ]}
                />
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'all', label: 'Prioridade' },
                    ...(Object.entries(priorityLabels) as [TicketPriority, string][]).map(
                      ([value, label]) => ({ value, label })
                    ),
                  ]}
                />
                <Select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  options={[
                    { value: 'all', label: 'Responsável' },
                    { value: 'none', label: 'Sem responsável' },
                    ...supportAgents.map((a) => ({ value: a.id, label: a.name })),
                  ]}
                />
              </div>

              {filtered.length === 0 ? (
                <SupportState
                  state="empty"
                  empty={{ title: 'Nenhum chamado na fila', description: 'Ajuste os filtros.' }}
                >
                  {null}
                </SupportState>
              ) : (
                <div className="space-y-3">
                  {filtered.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{t.subject}</p>
                            <TicketStatusBadge status={t.status} />
                            <PriorityBadge priority={t.priority} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t.realtorName} · {ticketCategoryLabels[t.category]} ·{' '}
                            {t.assigneeName || 'Sem responsável'} · {t.id}
                          </p>
                          <div className="mt-3 max-w-md">
                            <SlaBar ticket={t} />
                          </div>
                        </div>
                        <Link href={`/admin/support/${t.id}`}>
                          <Button size="sm">Atender</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </SupportState>
      </div>
    </div>
  )
}
