'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { isSuperAdmin } from '@/lib/auth'
import { Phase12State, StatusBadge, useUiLoad } from '@/components/professional/shared'
import {
  ProfessionalRequest,
  ProfessionalRequestStatus,
  formatCurrency,
  getAllProfessionalRequests,
  professionalStatusLabels,
} from '@/lib/phase12-data'
import { publicRealtorProfiles } from '@/lib/phase9-data'

export default function AdminProfessionalRequestsPage() {
  const router = useRouter()
  const { state, reload } = useUiLoad()
  const [allowed, setAllowed] = useState(false)
  const [list, setList] = useState<ProfessionalRequest[]>([])
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'solicitacoes' | 'publicadas'>('solicitacoes')

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setList(getAllProfessionalRequests())
  }, [router, state])

  const filtered = useMemo(() => {
    return list.filter((item) => {
      const matchStatus = status === 'all' || item.status === status
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        item.realtorName.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.form.slug.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [list, status, search])

  if (!allowed) return null

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Pág. Profissional' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Produção — Página Profissional
            </h1>
            <p className="text-sm text-muted-foreground">
              Visão global de todas as solicitações (R$ 497,00)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === 'solicitacoes' ? 'primary' : 'outline'}
              onClick={() => setTab('solicitacoes')}
            >
              Solicitações
            </Button>
            <Button
              size="sm"
              variant={tab === 'publicadas' ? 'primary' : 'outline'}
              onClick={() => setTab('publicadas')}
            >
              Páginas publicadas
            </Button>
          </div>
        </div>

        <Alert
          variant="info"
          title="Acesso Super Admin"
          description="Você visualiza todas as solicitações. Cada corretor vê apenas a própria."
        />

        <Phase12State state={state} onRetry={reload}>
          {tab === 'publicadas' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {publicRealtorProfiles.map((profile) => (
                <div key={profile.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-semibold text-foreground">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">/corretor/{profile.slug}</p>
                  <Link href={`/corretor/${profile.slug}`} className="mt-3 inline-block">
                    <Button size="sm" variant="outline">
                      Abrir vitrine
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <Input
                  placeholder="Buscar por corretor, ID ou slug"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos os status' },
                    ...Object.entries(professionalStatusLabels).map(([value, label]) => ({
                      value,
                      label,
                    })),
                  ]}
                />
              </div>

              {filtered.length === 0 ? (
                <Phase12State
                  state="empty"
                  empty={{
                    title: 'Nenhuma solicitação',
                    description: 'Ajuste os filtros ou aguarde novos pedidos.',
                  }}
                >
                  {null}
                </Phase12State>
              ) : (
                <div className="space-y-3">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{item.realtorName}</p>
                          <StatusBadge status={item.status as ProfessionalRequestStatus} />
                          <Badge variant="default">{item.id}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price)} · {item.producer} · prazo {item.dueDate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /corretor/{item.form.slug}
                          {item.form.wantsDomain ? ` · domínio ${item.form.customDomain || 'pendente'}` : ''}
                        </p>
                      </div>
                      <Link href={`/admin/professional/${item.id}`}>
                        <Button size="sm">Abrir detalhes</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Phase12State>
      </div>
    </div>
  )
}
