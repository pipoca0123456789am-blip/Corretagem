'use client'

import { Badge } from '@/components/design-system/feedback/badge'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { getClientHistory } from '@/lib/phase11-data'

export default function ClientHistoryPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  if (!profile) return null
  const history = getClientHistory(profile.firstName)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-sm text-muted-foreground">Linha do tempo do seu relacionamento com {profile.firstName}</p>
      </div>
      <PageState state={state} onRetry={reload}>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <Badge variant="default">{item.type}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{item.at}</p>
            </div>
          ))}
        </div>
      </PageState>
    </div>
  )
}
