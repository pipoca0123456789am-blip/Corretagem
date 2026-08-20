'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, Plus, Search } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  Appointment,
  filterByRealtor,
  formatDateBR,
  initialAppointments,
  visitStatusBadge,
  visitStatusLabels,
} from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import { realtorsList } from '@/lib/mock-data'

export default function VisitsPage() {
  const [loading, setLoading] = useState(true)
  const [visits, setVisits] = useState<Appointment[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      setVisits(filterByRealtor(initialAppointments).filter((a) => a.type === 'visita'))
      setLoading(false)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    return visits
      .filter((v) => {
        const q = search.toLowerCase()
        const matchesSearch =
          !q ||
          v.title.toLowerCase().includes(q) ||
          v.clientName?.toLowerCase().includes(q) ||
          v.propertyTitle?.toLowerCase().includes(q)
        const matchesStatus = statusFilter === 'all' || v.visitStatus === statusFilter
        const matchesRealtor = realtorFilter === 'all' || String(v.realtorId) === realtorFilter
        return matchesSearch && matchesStatus && matchesRealtor
      })
      .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))
  }, [visits, search, statusFilter, realtorFilter])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Agenda', href: '/agenda' },
          { label: 'Visitas' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Visitas</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe agendamentos de visita com status, confirmação e lembretes
            </p>
          </div>
          <Link href="/agenda">
            <Button variant="primary" className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Agendar visita
            </Button>
          </Link>
        </div>

        <Alert
          variant="info"
          title="Fluxo integrado à agenda"
          description="Novas visitas, reagendamentos e cancelamentos são gerenciados na Agenda. Aqui você acompanha o pipeline de visitas."
        />

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar por cliente, imóvel ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Select
              label="Status da visita"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                ...Object.entries(visitStatusLabels).map(([value, label]) => ({ value, label })),
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
            icon={<Eye className="w-8 h-8" />}
            title="Nenhuma visita encontrada"
            description="Cadastre uma visita na agenda ou ajuste os filtros."
            action={{ label: 'Ir para agenda', onClick: () => (window.location.href = '/agenda') }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((visit) => (
              <div key={visit.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-foreground truncate">{visit.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateBR(visit.date)} · {visit.startTime}–{visit.endTime} · {visit.durationMinutes} min
                    </p>
                  </div>
                  {visit.visitStatus && (
                    <Badge variant={visitStatusBadge(visit.visitStatus)}>
                      {visitStatusLabels[visit.visitStatus]}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Cliente:</span> {visit.clientName}</p>
                  <p><span className="text-muted-foreground">Imóvel:</span> {visit.propertyTitle}</p>
                  <p><span className="text-muted-foreground">Corretor:</span> {visit.realtorName}</p>
                  <p><span className="text-muted-foreground">Confirmação:</span> {visit.confirmed ? 'Confirmada' : 'Pendente'}</p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Local:</span> {visit.location || '—'}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Lembrete:</span>{' '}
                    {visit.reminder ? `Sim (${visit.reminderMinutes} min antes)` : 'Não'}
                  </p>
                </div>

                {visit.notes && (
                  <p className="text-sm text-muted-foreground border-t border-border pt-3">
                    {visit.notes}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href="/agenda">
                    <Button size="sm" variant="outline">
                      Gerenciar na agenda
                    </Button>
                  </Link>
                  <Link href={`/visits/${visit.id}`}>
                    <Button size="sm" variant="primary">
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
