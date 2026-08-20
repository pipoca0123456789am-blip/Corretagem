'use client'

import { Badge } from '@/components/design-system/feedback/badge'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { getClientVisits, visitStatusLabel } from '@/lib/phase11-data'

export default function ClientVisitsPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  if (!profile) return null
  const visits = getClientVisits(profile.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visitas agendadas</h1>
        <p className="text-sm text-muted-foreground">Com {profile.name}</p>
      </div>
      <PageState
        state={state === 'ready' && visits.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nenhuma visita"
        emptyDescription="Solicite uma visita a partir de um imóvel recomendado."
      >
        <div className="space-y-3">
          {visits.map((visit) => (
            <div key={visit.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{visit.propertyTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {visit.date} às {visit.time}
                  </p>
                </div>
                <Badge variant={visit.status === 'confirmada' ? 'success' : 'info'}>
                  {visitStatusLabel[visit.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  )
}
