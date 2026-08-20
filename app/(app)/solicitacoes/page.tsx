'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Input } from '@/components/design-system/forms/input'
import {
  RequestStatusBadge,
  SupportState,
  useSupportLoad,
} from '@/components/support/shared'
import {
  ServiceRequest,
  RequestType,
  formatCurrency,
  getScopedRequests,
  requestTypeLabels,
} from '@/lib/phase16-data'

export default function RequestsPage() {
  const { state, reload } = useSupportLoad()
  const [items, setItems] = useState<ServiceRequest[]>([])
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setItems(getScopedRequests())
  }, [state])

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const matchType = type === 'all' || r.type === type
      const q = search.toLowerCase()
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      return matchType && matchQ
    })
  }, [items, type, search])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Solicitações' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Central de solicitações</h1>
            <p className="text-sm text-muted-foreground">
              Página profissional, IA, domínio, plano e serviços — só os seus pedidos
            </p>
          </div>
          <Link href="/solicitacoes/nova">
            <Button>Nova solicitação</Button>
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <Input
            placeholder="Buscar solicitação"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'all', label: 'Todos os tipos' },
              ...(Object.entries(requestTypeLabels) as [RequestType, string][]).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </div>

        <SupportState
          state={state === 'ready' && filtered.length === 0 ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Nenhuma solicitação',
            description: 'Peça página profissional, IA, domínio ou alteração de plano.',
            action: {
              label: 'Nova solicitação',
              onClick: () => {
                window.location.href = '/solicitacoes/nova'
              },
            },
          }}
        >
          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{r.title}</p>
                    <RequestStatusBadge status={r.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {requestTypeLabels[r.type]}
                    {typeof r.amount === 'number' ? ` · ${formatCurrency(r.amount)}` : ''} · {r.id}
                  </p>
                </div>
                <Link href={`/solicitacoes/${r.id}`}>
                  <Button size="sm">Detalhes</Button>
                </Link>
              </div>
            ))}
          </div>
        </SupportState>
      </div>
    </div>
  )
}
