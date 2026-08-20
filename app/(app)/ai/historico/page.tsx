'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { AiPageState, useAiLoad } from '@/components/ai-agent/shared'
import { AiIntegration, getRealtorAi } from '@/lib/phase13-data'

export default function AiHistoryPage() {
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  useEffect(() => setAi(getRealtorAi()), [state])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Histórico' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
          <p className="text-sm text-muted-foreground">Linha do tempo do seu agente</p>
        </div>
        <AiPageState
          state={!ai && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Sem histórico', description: 'Eventos aparecerão após a solicitação.' }}
        >
          {ai ? (
            <ol className="space-y-3 border-l-2 border-border pl-4">
              {ai.history.map((item) => (
                <li key={item.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.at}</p>
                </li>
              ))}
            </ol>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}
