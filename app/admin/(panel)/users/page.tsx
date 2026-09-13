'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { realtorsList } from '@/lib/mock-data'

const users = [
  ...realtorsList.map((r) => ({
    id: `u-${r.id}`,
    name: r.name,
    email: r.email,
    role: 'Corretor',
    status: r.status === 'active' ? 'Ativo' : 'Inativo',
  })),
  {
    id: 'u-admin',
    name: 'Administrador Principal',
    email: 'admin@plataforma.com.br',
    role: 'Super Admin',
    status: 'Ativo',
  },
  {
    id: 'u-cliente',
    name: 'Cliente Demonstração',
    email: 'cliente@plataforma.com.br',
    role: 'Cliente',
    status: 'Ativo',
  },
]

export default function AdminUsersPage() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const query = q.toLowerCase()
    return users.filter((u) => !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
  }, [q])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/paineladmin' }, { label: 'Usuários' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Usuários da plataforma</h1>
          <p className="text-sm text-muted-foreground">Papéis e permissões — visão simulada</p>
        </div>
        <Alert
          variant="info"
          description="Seed limpa: admin@plataforma.com.br (Super Admin) e corretor@plataforma.com.br (Corretor)."
        />
        <Input placeholder="Buscar usuário" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-3">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <Badge variant="primary">{u.role}</Badge>
                  <Badge variant={u.status === 'Ativo' ? 'success' : 'default'}>{u.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/admin/realtors"><Button variant="outline">Ver corretores</Button></Link>
      </div>
    </div>
  )
}
