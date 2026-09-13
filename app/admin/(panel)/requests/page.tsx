'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin, isSupportAgent } from '@/lib/auth'
import {
  RequestStatusBadge,
  SupportState,
  useSupportLoad,
} from '@/components/support/shared'
import {
  RequestStatus,
  RequestType,
  ServiceRequest,
  formatCurrency,
  getScopedRequests,
  requestStatusLabels,
  requestTypeLabels,
} from '@/lib/phase16-data'

export default function AdminRequestsPage() {
  const router = useRouter()
  const { state, reload } = useSupportLoad()
  const [allowed, setAllowed] = useState(false)
  const [items, setItems] = useState<ServiceRequest[]>([])
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isSuperAdmin() && !isSupportAgent()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setItems(getScopedRequests())
  }, [router, state])

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const matchType = type === 'all' || r.type === type
      const matchStatus = status === 'all' || r.status === status
      const q = search.toLowerCase()
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.realtorName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      return matchType && matchStatus && matchQ
    })
  }, [items, type, status, search])

  if (!allowed) return null

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Solicitações' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Central de solicitações</h1>
            <p className="text-sm text-muted-foreground">
              Página profissional, IA, domínio, plano, cancelamento e serviços
            </p>
          </div>
          <Link href="/admin/professional">
            <Button variant="outline">Pág. Profissional</Button>
          </Link>
        </div>

        <Alert
          variant="info"
          description="Visão global. Observações internas ficam no detalhe e não aparecem para o corretor."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Buscar corretor, título ou ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: 'all', label: 'Tipo' },
              ...(Object.entries(requestTypeLabels) as [RequestType, string][]).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Status' },
              ...(Object.entries(requestStatusLabels) as [RequestStatus, string][]).map(
                ([value, label]) => ({ value, label })
              ),
            ]}
          />
        </div>

        <SupportState
          state={state === 'ready' && filtered.length === 0 ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Nenhuma solicitação', description: 'Ajuste os filtros.' }}
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
                    {r.realtorName} · {requestTypeLabels[r.type]}
                    {typeof r.amount === 'number' ? ` · ${formatCurrency(r.amount)}` : ''} · {r.id}
                  </p>
                </div>
                <Link href={`/admin/requests/${r.id}`}>
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
