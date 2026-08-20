'use client'

import { useMemo, useState } from 'react'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import { matchProperties } from '@/lib/phase11-data'

export default function ClientRecommendedPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [tick, setTick] = useState(0)
  const items = useMemo(
    () => (profile ? matchProperties(profile.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, tick]
  )

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Imóveis recomendados</h1>
        <p className="text-sm text-muted-foreground">
          Compatíveis com seu perfil, apenas de {profile.firstName}
        </p>
      </div>
      <PageState
        state={state === 'ready' && items.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nenhuma recomendação"
        emptyDescription="Atualize preferências ou aguarde novos imóveis deste corretor."
      >
        <ClientPropertyGrid
          properties={items}
          profile={profile}
          showDiscard
          onChange={() => setTick((t) => t + 1)}
        />
      </PageState>
    </div>
  )
}
