'use client'

import { useMemo } from 'react'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import { getViewedIds } from '@/lib/client-auth'
import { getRealtorProperties } from '@/lib/phase11-data'

export default function ClientViewedPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const items = useMemo(() => {
    if (!profile) return []
    const ids = getViewedIds()
    const map = new Map(getRealtorProperties(profile.id).map((p) => [p.id, p]))
    return ids.map((id) => map.get(id)).filter(Boolean) as ReturnType<typeof getRealtorProperties>
  }, [profile])

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Imóveis visualizados</h1>
        <p className="text-sm text-muted-foreground">Histórico recente na carteira do seu corretor</p>
      </div>
      <PageState
        state={state === 'ready' && items.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nenhuma visualização"
        emptyDescription="Ao abrir anúncios, eles aparecerão aqui."
      >
        <ClientPropertyGrid properties={items} profile={profile} />
      </PageState>
    </div>
  )
}
