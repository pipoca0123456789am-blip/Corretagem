'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Input } from '@/components/design-system/forms/input'
import {
  PriorityBadge,
  SupportState,
  TicketStatusBadge,
  useSupportLoad,
} from '@/components/support/shared'
import {
  SupportTicket,
  TicketStatus,
  getScopedTickets,
  ticketCategoryLabels,
  ticketStatusLabels,
} from '@/lib/phase16-data'

export default function TicketsListPage() {
  const { state, reload } = useSupportLoad()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTickets(getScopedTickets())
  }, [state])

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = status === 'all' || t.status === status
      const q = search.toLowerCase()
      const matchQ =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        ticketCategoryLabels[t.category].toLowerCase().includes(q)
      return matchStatus && matchQ
    })
  }, [tickets, status, search])

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Ajuda', href: '/help' },
          { label: 'Chamados' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus chamados</h1>
            <p className="text-sm text-muted-foreground">Somente os chamados da sua conta</p>
          </div>
          <Link href="/help/chamados/novo">
            <Button>Abrir chamado</Button>
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            placeholder="Buscar por assunto, ID ou categoria"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os status' },
              ...(Object.entries(ticketStatusLabels) as [TicketStatus, string][]).map(
                ([value, label]) => ({ value, label })
              ),
            ]}
          />
        </div>

        <SupportState
          state={state === 'ready' && filtered.length === 0 ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Nenhum chamado',
            description: 'Abra um chamado quando precisar de suporte.',
            action: {
              label: 'Abrir chamado',
              onClick: () => {
                window.location.href = '/help/chamados/novo'
              },
            },
          }}
        >
          <div className="space-y-3">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{t.subject}</p>
                    <TicketStatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.id} · {ticketCategoryLabels[t.category]} · atualizado{' '}
                    {new Date(t.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Link href={`/help/chamados/${t.id}`}>
                  <Button size="sm">Abrir</Button>
                </Link>
              </div>
            ))}
          </div>
        </SupportState>
      </div>
    </div>
  )
}
