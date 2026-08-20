'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import {
  Appointment,
  filterByRealtor,
  formatDateBR,
  initialAppointments,
  visitStatusBadge,
  visitStatusLabels,
  appointmentStatusBadge,
  appointmentStatusLabels,
} from '@/lib/phase7-data'

export default function VisitDetailPage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [visit, setVisit] = useState<Appointment | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      const found = filterByRealtor(initialAppointments).find(
        (a) => a.id === id && a.type === 'visita'
      )
      setVisit(found || null)
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Alert
          variant="destructive"
          title="Visita não encontrada"
          description="Esta visita não existe ou você não tem permissão para visualizá-la."
        />
        <Link href="/visits">
          <Button variant="outline">Voltar para visitas</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Visitas', href: '/visits' },
          { label: visit.title },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{visit.title}</h1>
            <p className="text-muted-foreground mt-1">
              {formatDateBR(visit.date)} · {visit.startTime}–{visit.endTime}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={appointmentStatusBadge(visit.status)}>
                {appointmentStatusLabels[visit.status]}
              </Badge>
              {visit.visitStatus && (
                <Badge variant={visitStatusBadge(visit.visitStatus)}>
                  {visitStatusLabels[visit.visitStatus]}
                </Badge>
              )}
            </div>
          </div>
          <Link href="/agenda">
            <Button variant="primary">Abrir na agenda</Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p><span className="text-muted-foreground">Cliente:</span> {visit.clientName}</p>
          <p><span className="text-muted-foreground">Imóvel:</span> {visit.propertyTitle}</p>
          <p><span className="text-muted-foreground">Corretor:</span> {visit.realtorName}</p>
          <p><span className="text-muted-foreground">Duração:</span> {visit.durationMinutes} minutos</p>
          <p><span className="text-muted-foreground">Confirmação:</span> {visit.confirmed ? 'Confirmada' : 'Aguardando'}</p>
          <p><span className="text-muted-foreground">Lembrete:</span> {visit.reminder ? `${visit.reminderMinutes} min antes` : 'Desativado'}</p>
          <p className="sm:col-span-2"><span className="text-muted-foreground">Local de encontro:</span> {visit.location || '—'}</p>
          <p className="sm:col-span-2"><span className="text-muted-foreground">Observações:</span> {visit.notes || '—'}</p>
        </div>
      </div>
    </div>
  )
}
