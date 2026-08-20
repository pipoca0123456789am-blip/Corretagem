'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { isSuperAdmin } from '@/lib/auth'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { realtorsList } from '@/lib/mock-data'
import {
  Revenue,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialRevenues,
  revenueCategories,
} from '@/lib/phase8-data'

export default function RevenuesPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Revenue[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState<Revenue | null>(null)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'Comissão de venda',
    amount: '',
    date: '2026-07-28',
    source: '',
    notes: '',
  })

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      setItems(filterByRealtor(initialRevenues))
      setLoading(false)
    }, 450)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return items.filter((r) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || r.category === category
      const matchesRealtor = realtorFilter === 'all' || String(r.realtorId) === realtorFilter
      return matchesSearch && matchesCategory && matchesRealtor
    })
  }, [items, search, category, realtorFilter])

  const total = filtered.reduce((s, r) => s + r.amount, 0)

  const createRevenue = () => {
    if (!form.title || !form.amount) return
    const realtorId = getCurrentRealtorId() ?? 1
    const realtor = realtorsList.find((r) => r.id === realtorId) || realtorsList[0]
    const created: Revenue = {
      id: `rev-${Date.now()}`,
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      source: form.source || 'Lançamento manual',
      realtorId: realtor.id,
      realtorName: realtor.name,
      notes: form.notes,
      attachments: [],
    }
    setItems((prev) => [created, ...prev])
    setFormOpen(false)
    setSuccess('Receita lançada com sucesso.')
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Financeiro', href: '/financial' },
          { label: 'Receitas' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Receitas</h1>
            <p className="text-muted-foreground mt-1">
              Total filtrado: {formatCurrency(total)}
            </p>
          </div>
          <Button variant="primary" className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova receita
          </Button>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar receitas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Todas' },
                ...revenueCategories.map((c) => ({ value: c, label: c })),
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
          <EmptyState title="Nenhuma receita" description="Cadastre uma receita ou limpe os filtros." />
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDetail(r)}
                className="w-full text-left bg-card border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{r.title}</p>
                      <Badge variant="success">{r.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateBR(r.date)} · {r.source}
                      {isAdmin ? ` · ${r.realtorName}` : ''}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(r.amount)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nova receita"
        size="lg"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={createRevenue}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select
            label="Categoria"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={revenueCategories.map((c) => ({ value: c, label: c }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor (R$)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <Input label="Origem" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <Textarea label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        description="Detalhes da receita"
        footer={<Button variant="tertiary" onClick={() => setDetail(null)}>Fechar</Button>}
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Categoria:</span> {detail.category}</p>
            <p><span className="text-muted-foreground">Valor:</span> {formatCurrency(detail.amount)}</p>
            <p><span className="text-muted-foreground">Data:</span> {formatDateBR(detail.date)}</p>
            <p><span className="text-muted-foreground">Origem:</span> {detail.source}</p>
            <p><span className="text-muted-foreground">Observações:</span> {detail.notes || '—'}</p>
            <p><span className="text-muted-foreground">Anexos:</span> {detail.attachments.length || 'Nenhum'}</p>
            {detail.commissionId && (
              <Link href={`/financial/commissions/${detail.commissionId}`} className="text-primary text-sm">
                Ver comissão vinculada
              </Link>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
