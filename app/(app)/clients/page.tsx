'use client'

import { useEffect, useMemo, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { Plus } from 'lucide-react'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'

type ClientRow = {
  id: string
  realtorId: number
  name: string
  email: string
  phone: string
  stage: string
  origin: string
}

const seedClients: ClientRow[] = []

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [admin, setAdmin] = useState(false)
  const [realtorId, setRealtorId] = useState<number | null>(1)
  const [created, setCreated] = useState(false)

  useEffect(() => {
    setAdmin(isSuperAdmin())
    setRealtorId(getCurrentRealtorId())
  }, [])

  const clients = useMemo(() => {
    const base = admin || realtorId === null
      ? seedClients
      : seedClients.filter((c) => c.realtorId === realtorId)
    const q = search.toLowerCase()
    return base.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    )
  }, [admin, realtorId, search])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Clientes' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Clientes</h1>
            <p className="text-sm text-muted-foreground">
              {admin ? 'Visão global dos clientes por corretor' : 'Somente clientes da sua carteira'}
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => setCreated(true)}
          >
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        </div>

        {created ? (
          <Alert
            variant="success"
            description="Cadastro simulado. Nenhum cliente real foi criado."
            onClose={() => setCreated(false)}
          />
        ) : null}

        <Alert
          variant="info"
          description="Clientes permanecem vinculados ao corretor de origem. Sem compartilhamento entre carteiras."
        />

        <Input
          placeholder="Buscar por nome, e-mail ou telefone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {clients.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Ajuste a busca ou cadastre um novo contato da sua carteira."
          />
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <Badge variant="primary">{c.stage}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.email} · {c.phone} · {c.origin}
                    {admin ? ` · corretor #${c.realtorId}` : ''}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setCreated(true)}>
                  Abrir (simulado)
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
