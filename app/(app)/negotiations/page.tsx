'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Handshake, Plus, Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Badge } from '@/components/design-system/feedback/badge'
import { Modal } from '@/components/design-system/feedback/modal'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import {
  Negotiation,
  clientsOptions,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialNegotiations,
  negotiationStatusBadge,
  negotiationStatusLabels,
  propertyOptions,
} from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import { realtorsList } from '@/lib/mock-data'

const emptyForm = {
  clientName: '',
  propertyId: '',
  ownerName: '',
  requestedValue: '',
  offeredValue: '',
  downPayment: '',
  financing: '',
  conditions: '',
  deadline: '',
  commissionPercent: '5',
  observations: '',
  realtorId: 1,
}

export default function NegotiationsPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Negotiation[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [success, setSuccess] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      setItems(filterByRealtor(initialNegotiations))
      setLoading(false)
    }, 550)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return items.filter((n) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        n.code.toLowerCase().includes(q) ||
        n.clientName.toLowerCase().includes(q) ||
        n.propertyTitle.toLowerCase().includes(q) ||
        n.ownerName.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || n.status === statusFilter
      const matchesRealtor = realtorFilter === 'all' || String(n.realtorId) === realtorFilter
      return matchesSearch && matchesStatus && matchesRealtor
    })
  }, [items, search, statusFilter, realtorFilter])

  const metrics = useMemo(() => {
    const active = items.filter((n) =>
      !['fechada', 'recusada', 'cancelada'].includes(n.status)
    ).length
    const closed = items.filter((n) => n.status === 'fechada').length
    const pipeline = items
      .filter((n) => !['fechada', 'recusada', 'cancelada'].includes(n.status))
      .reduce((sum, n) => sum + n.offeredValue, 0)
    const commission = items
      .filter((n) => n.status === 'fechada')
      .reduce((sum, n) => sum + n.commissionValue, 0)
    return { active, closed, pipeline, commission }
  }, [items])

  const createNegotiation = () => {
    if (!form.clientName || !form.propertyId || !form.offeredValue) {
      setFormError('Preencha cliente, imóvel e valor ofertado.')
      return
    }
    const property = propertyOptions.find((p) => p.value === form.propertyId)
    const realtor = realtorsList.find((r) => r.id === form.realtorId) || realtorsList[0]
    const offered = Number(form.offeredValue) || 0
    const commissionPercent = Number(form.commissionPercent) || 0

    const created: Negotiation = {
      id: `neg-${Date.now()}`,
      code: `NEG-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      clientName: form.clientName,
      clientEmail: `${form.clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      clientPhone: '(11) 90000-0000',
      propertyId: Number(form.propertyId),
      propertyTitle: property?.label || 'Imóvel',
      propertyAddress: 'São Paulo - SP',
      ownerName: form.ownerName || 'Proprietário',
      ownerEmail: 'proprietario@email.com',
      realtorId: realtor.id,
      realtorName: realtor.name,
      requestedValue: Number(form.requestedValue) || offered,
      offeredValue: offered,
      downPayment: Number(form.downPayment) || 0,
      financing: Number(form.financing) || 0,
      conditions: form.conditions || 'Condições a definir',
      deadline: form.deadline || '2026-08-30',
      commissionPercent,
      commissionValue: Math.round(offered * (commissionPercent / 100)),
      status: 'proposta_em_preparacao',
      observations: form.observations,
      documents: [
        { id: 'd1', name: 'RG e CPF do comprador', status: 'pendente', required: true },
        { id: 'd2', name: 'Comprovante de renda', status: 'pendente', required: true },
        { id: 'd3', name: 'Matrícula atualizada do imóvel', status: 'pendente', required: true },
      ],
      timeline: [
        {
          id: 't1',
          date: formatDateBR(new Date().toISOString().slice(0, 10)).split('/').reverse().join('-'),
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          title: 'Proposta em preparação',
          description: 'Negociação criada pelo corretor.',
          actor: realtor.name,
          type: 'status',
        },
      ],
      checklist: [
        { id: 'c1', label: 'Proposta aceita por ambas as partes', done: false, required: true },
        { id: 'c2', label: 'Documentação do comprador completa', done: false, required: true },
        { id: 'c3', label: 'Documentação do imóvel completa', done: false, required: true },
        { id: 'c4', label: 'Contrato revisado pelo jurídico', done: false, required: true },
        { id: 'c5', label: 'Assinaturas coletadas', done: false, required: true },
        { id: 'c6', label: 'Comissão registrada', done: false, required: true },
        { id: 'c7', label: 'Chaves e inventário combinados', done: false, required: false },
      ],
      contractReady: false,
      signatureStatus: 'nao_iniciada',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Fix timeline date to ISO
    created.timeline[0].date = new Date().toISOString().slice(0, 10)

    setItems((prev) => [created, ...prev])
    setFormOpen(false)
    setForm(emptyForm)
    setFormError('')
    setSuccess('Negociação criada com sucesso.')
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Negociações' }]} />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Propostas e Negociações
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? 'Visão global de propostas, contrapropostas e fechamentos'
                : 'Gerencie suas propostas, contrapropostas e fechamentos'}
            </p>
          </div>
          <Button variant="primary" className="gap-2 w-full sm:w-auto" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova proposta
          </Button>
        </div>

        {success && (
          <Alert variant="success" title="Sucesso" description={success} onClose={() => setSuccess('')} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard title="Em andamento" value={String(metrics.active)} />
          <MetricCard title="Fechadas" value={String(metrics.closed)} />
          <MetricCard title="Pipeline" value={formatCurrency(metrics.pipeline)} />
          <MetricCard title="Comissão realizada" value={formatCurrency(metrics.commission)} />
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar por código, cliente, imóvel ou proprietário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                ...Object.entries(negotiationStatusLabels).map(([value, label]) => ({
                  value,
                  label,
                })),
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
            icon={<Handshake className="w-8 h-8" />}
            title="Nenhuma negociação encontrada"
            description="Crie uma nova proposta ou ajuste os filtros."
            action={{ label: 'Nova proposta', onClick: () => setFormOpen(true) }}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{n.code}</p>
                    <Badge variant={negotiationStatusBadge(n.status)}>
                      {negotiationStatusLabels[n.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">{n.propertyTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {n.clientName} · Proprietário: {n.ownerName}
                    {isAdmin ? ` · ${n.realtorName}` : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Solicitado {formatCurrency(n.requestedValue)} · Ofertado{' '}
                    {formatCurrency(n.offeredValue)} · Prazo {formatDateBR(n.deadline)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/negotiations/${n.id}`}>
                    <Button size="sm" variant="primary">
                      Abrir
                    </Button>
                  </Link>
                  <Link href={`/negotiations/${n.id}/documents`}>
                    <Button size="sm" variant="outline">
                      Documentos
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nova proposta"
        description="Cadastre uma proposta para iniciar a negociação"
        size="lg"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={createNegotiation}>
              Criar proposta
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <Alert variant="destructive" description={formError} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Cliente"
              placeholder="Selecione"
              options={clientsOptions}
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
            <Select
              label="Imóvel"
              placeholder="Selecione"
              options={propertyOptions}
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
            />
            <Input
              label="Proprietário"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
            {isAdmin && (
              <Select
                label="Corretor"
                options={realtorsList.map((r) => ({ value: String(r.id), label: r.name }))}
                value={String(form.realtorId)}
                onChange={(e) => setForm({ ...form, realtorId: Number(e.target.value) })}
              />
            )}
            <Input
              label="Valor solicitado (R$)"
              type="number"
              value={form.requestedValue}
              onChange={(e) => setForm({ ...form, requestedValue: e.target.value })}
            />
            <Input
              label="Valor ofertado (R$)"
              type="number"
              value={form.offeredValue}
              onChange={(e) => setForm({ ...form, offeredValue: e.target.value })}
            />
            <Input
              label="Entrada (R$)"
              type="number"
              value={form.downPayment}
              onChange={(e) => setForm({ ...form, downPayment: e.target.value })}
            />
            <Input
              label="Financiamento (R$)"
              type="number"
              value={form.financing}
              onChange={(e) => setForm({ ...form, financing: e.target.value })}
            />
            <Input
              label="Prazo"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <Input
              label="Comissão (%)"
              type="number"
              value={form.commissionPercent}
              onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
            />
          </div>
          <Textarea
            label="Condições"
            value={form.conditions}
            onChange={(e) => setForm({ ...form, conditions: e.target.value })}
          />
          <Textarea
            label="Observações"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  )
}
