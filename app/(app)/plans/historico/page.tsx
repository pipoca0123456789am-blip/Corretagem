'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { BillingState, useBillingLoad } from '@/components/billing/shared'
import { getRealtorSubscription } from '@/lib/phase14-data'

export default function PlansHistoryPage() {
  const { state, reload } = useBillingLoad()
  const [history, setHistory] = useState<{ id: string; label: string; at: string }[]>([])

  useEffect(() => {
    setHistory(getRealtorSubscription()?.history || [])
  }, [state])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planos', href: '/plans' }, { label: 'Histórico' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico da assinatura</h1>
          <p className="text-sm text-muted-foreground">Eventos da sua conta — escopo individual</p>
        </div>
        <BillingState
          state={state === 'ready' && history.length === 0 ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Sem histórico', description: 'Ações de plano aparecerão aqui.' }}
        >
          <ol className="space-y-3 border-l-2 border-border pl-4">
            {history.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.at}</p>
              </li>
            ))}
          </ol>
        </BillingState>
      </div>
    </div>
  )
}
