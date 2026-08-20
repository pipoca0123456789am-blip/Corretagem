'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { isSuperAdmin } from '@/lib/auth'
import { realtorsList } from '@/lib/mock-data'
import {
  Commission,
  CommissionStatus,
  commissionStatusBadge,
  commissionStatusLabels,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialCommissions,
} from '@/lib/phase8-data'

export default function CommissionsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Commission[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [success, setSuccess] = useState('')
  const [confirmPay, setConfirmPay] = useState<Commission | null>(null)

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      setItems(filterByRealtor(initialCommissions))
      setLoading(false)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.propertyTitle.toLowerCase().includes(q) ||
        c.negotiationCode.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      const matchesType = typeFilter === 'all' || c.dealType === typeFilter
      const matchesRealtor = realtorFilter === 'all' || String(c.realtorId) === realtorFilter
      return matchesSearch && matchesStatus && matchesType && matchesRealtor
    })
  }, [items, search, statusFilter, typeFilter, realtorFilter])

  const markPaid = () => {
    if (!confirmPay) return
    setItems((prev) =>
      prev.map((c) =>
        c.id === confirmPay.id
          ? {
              ...c,
              status: 'paga' as CommissionStatus,
              paidAmount: c.commissionValue,
              receivedDate: '2026-07-28',
              history: [
                ...c.history,
                {
                  id: `h-${Date.now()}`,
                  date: '2026-07-28',
                  title: 'Paga',
                  description: 'Pagamento confirmado manualmente (simulado).',
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    )
    setConfirmPay(null)
    setSuccess('Comissão marcada como paga.')
    setTimeout(() => setSuccess(''), 3000)
  }

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
          { label: 'Comissões' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comissões</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o fluxo completo: calculada → pagamento
          </p>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar por código, cliente, imóvel ou negociação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                ...Object.entries(commissionStatusLabels).map(([value, label]) => ({ value, label })),
              ]}
            />
            <Select
              label="Tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'venda', label: 'Venda' },
                { value: 'locacao', label: 'Locação' },
              ]}
            />
            {isAdmin && (
              <Select
                label="Corretor"
                value={realtorFilter}
                onChange={(e) => setRealtorFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos' },
                  ...realtorsList.map((r) => ({ value: String(r.id), label: r.name })),
                ]}
              />
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma comissão encontrada"
            description="Ajuste os filtros ou aguarde novos fechamentos."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{c.code}</p>
                    <Badge variant={commissionStatusBadge(c.status)}>
                      {commissionStatusLabels[c.status]}
                    </Badge>
                    <Badge variant="default">{c.dealType === 'venda' ? 'Venda' : 'Locação'}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{c.propertyTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.clientName} · {c.negotiationCode} · {c.percent}%
                    {isAdmin ? ` · ${c.realtorName}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Negócio {formatCurrency(c.dealValue)} · Comissão {formatCurrency(c.commissionValue)}
                    {c.paidAmount > 0 ? ` · Pago ${formatCurrency(c.paidAmount)}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/financial/commissions/${c.id}`}>
                    <Button size="sm" variant="primary">Detalhes</Button>
                  </Link>
                  {c.status !== 'paga' && c.status !== 'cancelada' && (
                    <Button size="sm" variant="secondary" onClick={() => setConfirmPay(c)}>
                      Marcar paga
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!confirmPay}
        onClose={() => setConfirmPay(null)}
        title="Confirmar pagamento da comissão"
        description="Ação crítica — confirma o recebimento integral?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmPay(null)}>Cancelar</Button>
            <Button variant="primary" onClick={markPaid}>Confirmar pagamento</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {confirmPay?.code} · {confirmPay ? formatCurrency(confirmPay.commissionValue) : ''}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Nenhum pagamento real será processado.
        </p>
      </Modal>
    </div>
  )
}
