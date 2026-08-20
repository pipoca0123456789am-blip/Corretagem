'use client'

import { useMemo, useState } from 'react'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import { getFavoriteIds } from '@/lib/client-auth'
import { getRealtorProperties } from '@/lib/phase11-data'

export default function ClientFavoritesPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [tick, setTick] = useState(0)
  const items = useMemo(() => {
    if (!profile) return []
    const ids = getFavoriteIds()
    return getRealtorProperties(profile.id).filter((p) => ids.includes(p.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, tick])

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
        <p className="text-sm text-muted-foreground">Seus imóveis salvos com {profile.firstName}</p>
      </div>
      <PageState
        state={state === 'ready' && items.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nenhum favorito"
        emptyDescription="Favorite imóveis recomendados para acompanhar aqui."
      >
        <ClientPropertyGrid properties={items} profile={profile} onChange={() => setTick((t) => t + 1)} />
      </PageState>
    </div>
  )
}
