'use client'

import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import { getNewProperties } from '@/lib/phase11-data'

export default function ClientNewPropertiesPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  if (!profile) return null
  const items = getNewProperties(profile.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Novos imóveis</h1>
        <p className="text-sm text-muted-foreground">Publicações recentes da carteira do seu corretor</p>
      </div>
      <PageState
        state={state === 'ready' && items.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Sem novidades"
        emptyDescription={`${profile.firstName} ainda não publicou novos imóveis.`}
      >
        <ClientPropertyGrid properties={items} profile={profile} showDiscard />
      </PageState>
    </div>
  )
}
