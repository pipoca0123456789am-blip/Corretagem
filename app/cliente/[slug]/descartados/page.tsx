'use client'

import { useMemo, useState } from 'react'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import { Button } from '@/components/design-system/buttons/button'
import { getDiscardedIds, restoreDiscarded } from '@/lib/client-auth'
import { getRealtorProperties } from '@/lib/phase11-data'

export default function ClientDiscardedPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [tick, setTick] = useState(0)
  const items = useMemo(() => {
    if (!profile) return []
    const ids = getDiscardedIds()
    return getRealtorProperties(profile.id).filter((p) => ids.includes(p.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, tick])

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Imóveis descartados</h1>
          <p className="text-sm text-muted-foreground">Você pode restaurar opções desta lista</p>
        </div>
      </div>
      <PageState
        state={state === 'ready' && items.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nenhum imóvel descartado"
        emptyDescription="Itens removidos das recomendações aparecerão aqui."
      >
        <div className="space-y-4">
          {items.map((property) => (
            <div key={property.id} className="rounded-xl border border-border p-3">
              <div className="mb-2 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    restoreDiscarded(property.id)
                    setTick((t) => t + 1)
                  }}
                >
                  Restaurar
                </Button>
              </div>
              <ClientPropertyGrid properties={[property]} profile={profile} />
            </div>
          ))}
        </div>
      </PageState>
    </div>
  )
}
