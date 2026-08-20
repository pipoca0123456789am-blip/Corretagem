'use client'

import { Badge } from '@/components/design-system/feedback/badge'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { formatCurrency, getClientProposals, proposalStatusLabel } from '@/lib/phase11-data'

export default function ClientProposalsPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  if (!profile) return null
  const proposals = getClientProposals(profile.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Propostas</h1>
        <p className="text-sm text-muted-foreground">Enviadas exclusivamente para {profile.firstName}</p>
      </div>
      <PageState
        state={state === 'ready' && proposals.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nenhuma proposta"
        emptyDescription="Use a ação Fazer proposta nos imóveis."
      >
        <div className="space-y-3">
          {proposals.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{item.propertyTitle}</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <p className="mt-2 text-sm font-medium text-primary">{formatCurrency(item.value)}</p>
                </div>
                <Badge variant="warning">{proposalStatusLabel[item.status]}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Enviada em {item.createdAt}</p>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  )
}
