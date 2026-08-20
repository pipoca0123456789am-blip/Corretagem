'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Progress } from '@/components/design-system/feedback/progress'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { AiPageState, useAiLoad } from '@/components/ai-agent/shared'
import { AI_INTEGRATION_PRICE, AI_PRICE_PROVISIONAL, AiIntegration, formatCurrency, getRealtorAi } from '@/lib/phase13-data'

export default function AiConsumptionPage() {
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  useEffect(() => setAi(getRealtorAi()), [state])
  const pct = ai ? Math.round((ai.consumption.messagesUsed / ai.consumption.messagesLimit) * 100) : 0

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Consumo' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consumo</h1>
          <p className="text-sm text-muted-foreground">Uso simulado do ciclo atual</p>
        </div>
        <AiPageState
          state={!ai && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Sem dados de consumo', description: 'Contrate a IA para acompanhar o uso.' }}
        >
          {ai ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">{ai.consumption.periodLabel}</p>
                {AI_PRICE_PROVISIONAL ? <Badge variant="info">R$ 97 provisório</Badge> : null}
              </div>
              <Progress value={pct} label="Mensagens do ciclo" />
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                <p>Usadas: <strong>{ai.consumption.messagesUsed}</strong></p>
                <p>Limite: <strong>{ai.consumption.messagesLimit}</strong></p>
                <p>Follow-ups: <strong>{ai.consumption.followUpsSent}</strong></p>
              </div>
              <Alert
                variant="info"
                description={`Custo estimado do ciclo: ${formatCurrency(ai.consumption.estimatedCost || AI_INTEGRATION_PRICE)}. Sem faturamento real.`}
              />
            </div>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}
