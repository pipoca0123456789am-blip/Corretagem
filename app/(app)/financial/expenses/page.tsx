'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { isSuperAdmin } from '@/lib/auth'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { realtorsList } from '@/lib/mock-data'
import {
  Expense,
  expenseCategories,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialExpenses,
} from '@/lib/phase8-data'

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Expense[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null)
  const [detail, setDetail] = useState<Expense | null>(null)
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: 'Marketing',
    amount: '',
    date: '2026-07-28',
    paymentMethod: 'Pix',
    notes: '',
    recurring: false,
  })

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      setItems(filterByRealtor(initialExpenses))
      setLoading(false)
    }, 450)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return items.filter((e) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || e.category === category
      const matchesRealtor = realtorFilter === 'all' || String(e.realtorId) === realtorFilter
      return matchesSearch && matchesCategory && matchesRealtor
    })
  }, [items, search, category, realtorFilter])

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const createExpense = () => {
    if (!form.title || !form.amount) return
    const realtorId = getCurrentRealtorId() ?? 1
    const realtor = realtorsList.find((r) => r.id === realtorId) || realtorsList[0]
    const created: Expense = {
      id: `exp-${Date.now()}`,
      title: form.title,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      realtorId: realtor.id,
      realtorName: realtor.name,
      notes: form.notes,
      attachments: [],
      recurring: form.recurring,
    }
    setItems((prev) => [created, ...prev])
    setFormOpen(false)
    setSuccess('Despesa lançada com sucesso.')
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
          { label: 'Despesas' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Despesas</h1>
            <p className="text-muted-foreground mt-1">Total filtrado: {formatCurrency(total)}</p>
          </div>
          <Button variant="primary" className="gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4" />
            Nova despesa
          </Button>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar despesas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Todas' },
                ...expenseCategories.map((c) => ({ value: c, label: c })),
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
          <EmptyState title="Nenhuma despesa" description="Cadastre uma despesa ou limpe os filtros." />
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <button type="button" className="text-left min-w-0 flex-1" onClick={() => setDetail(e)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{e.title}</p>
                    <Badge variant="warning">{e.category}</Badge>
                    {e.recurring && <Badge variant="info">Recorrente</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateBR(e.date)} · {e.paymentMethod}
                    {isAdmin ? ` · ${e.realtorName}` : ''}
                  </p>
                </button>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{formatCurrency(e.amount)}</p>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(e)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nova despesa"
        size="lg"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={createExpense}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select
            label="Categoria"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={expenseCategories.map((c) => ({ value: c, label: c }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor (R$)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <Input label="Forma de pagamento" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} />
          <Textarea label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={form.recurring}
              onCheckedChange={(checked) => setForm({ ...form, recurring: checked })}
            />
            <label htmlFor="recurring" className="text-sm text-foreground">Despesa recorrente</label>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        footer={<Button variant="tertiary" onClick={() => setDetail(null)}>Fechar</Button>}
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Categoria:</span> {detail.category}</p>
            <p><span className="text-muted-foreground">Valor:</span> {formatCurrency(detail.amount)}</p>
            <p><span className="text-muted-foreground">Data:</span> {formatDateBR(detail.date)}</p>
            <p><span className="text-muted-foreground">Pagamento:</span> {detail.paymentMethod}</p>
            <p><span className="text-muted-foreground">Anexos:</span> {detail.attachments.length || 'Nenhum'}</p>
            <p><span className="text-muted-foreground">Observações:</span> {detail.notes || '—'}</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Excluir despesa"
        description="Confirma a exclusão deste lançamento?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!confirmDelete) return
                setItems((prev) => prev.filter((e) => e.id !== confirmDelete.id))
                setConfirmDelete(null)
                setSuccess('Despesa excluída.')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Confirmar exclusão
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {confirmDelete?.title} · {confirmDelete ? formatCurrency(confirmDelete.amount) : ''}
        </p>
      </Modal>
    </div>
  )
}
