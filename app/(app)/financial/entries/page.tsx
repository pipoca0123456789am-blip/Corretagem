'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin } from '@/lib/auth'
import { realtorsList } from '@/lib/mock-data'
import {
  LedgerEntry,
  buildLedger,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialCommissions,
  initialExpenses,
  initialRevenues,
} from '@/lib/phase8-data'

export default function EntriesPage() {
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [detail, setDetail] = useState<LedgerEntry | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      const revenues = filterByRealtor(initialRevenues)
      const expenses = filterByRealtor(initialExpenses)
      const commissions = filterByRealtor(initialCommissions)
      setEntries(buildLedger(revenues, expenses, commissions).reverse())
      setLoading(false)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all' || e.type === typeFilter
      const matchesRealtor = realtorFilter === 'all' || String(e.realtorId) === realtorFilter
      return matchesSearch && matchesType && matchesRealtor
    })
  }, [entries, search, typeFilter, realtorFilter])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Financeiro', href: '/financial' },
          { label: 'Lançamentos' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Lançamentos</h1>
            <p className="text-muted-foreground mt-1">
              Extrato unificado de receitas, despesas e comissões
            </p>
          </div>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            Exportar visão
          </Button>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar lançamentos..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'receita', label: 'Receita' },
                { value: 'despesa', label: 'Despesa' },
                { value: 'comissao', label: 'Comissão' },
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
          <EmptyState title="Nenhum lançamento" description="Não há movimentos para os filtros atuais." />
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
            {filtered.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setDetail(entry)}
                className="w-full text-left p-4 hover:bg-muted/20 transition-colors flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground truncate">{entry.description}</p>
                    <Badge
                      variant={
                        entry.type === 'despesa'
                          ? 'destructive'
                          : entry.type === 'comissao'
                            ? 'primary'
                            : 'success'
                      }
                    >
                      {entry.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateBR(entry.date)} · {entry.category}
                    {isAdmin ? ` · ${entry.realtorName}` : ''}
                  </p>
                </div>
                <div className="text-sm text-right">
                  <p className={`font-semibold ${entry.amount < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {formatCurrency(entry.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">Saldo {formatCurrency(entry.balanceAfter)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Detalhe do lançamento"
        footer={<Button variant="tertiary" onClick={() => setDetail(null)}>Fechar</Button>}
      >
        {detail && (
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Descrição:</span> {detail.description}</p>
            <p><span className="text-muted-foreground">Tipo:</span> {detail.type}</p>
            <p><span className="text-muted-foreground">Categoria:</span> {detail.category}</p>
            <p><span className="text-muted-foreground">Valor:</span> {formatCurrency(detail.amount)}</p>
            <p><span className="text-muted-foreground">Data:</span> {formatDateBR(detail.date)}</p>
            <p><span className="text-muted-foreground">Saldo após:</span> {formatCurrency(detail.balanceAfter)}</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exportar lançamentos"
        description="Exportação visual simulada"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setExportOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setExportOpen(false)
                setSuccess('Exportação visual gerada (simulada).')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Nenhum arquivo será baixado nesta demonstração.</p>
      </Modal>
    </div>
  )
}
