'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, CalendarDays, Users, ArrowLeftRight, Timer } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Alert } from '@/components/design-system/feedback/alert'
import { AiPageState, useAiLoad } from '@/components/ai-agent/shared'
import { AiIntegration, getRealtorAi } from '@/lib/phase13-data'

export default function AiMetricsPage() {
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  useEffect(() => setAi(getRealtorAi()), [state])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Métricas' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Métricas</h1>
          <p className="text-sm text-muted-foreground">Desempenho simulado do seu agente</p>
        </div>
        <AiPageState
          state={!ai?.metrics && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Sem métricas', description: 'Disponível após ativação do agente.' }}
        >
          {ai ? (
            <>
              <Alert variant="info" description={`Período: ${ai.metrics.periodLabel}`} />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard title="Conversas" value={ai.metrics.conversations} icon={<MessageCircle className="h-5 w-5" />} />
                <MetricCard title="Leads qualificados" value={ai.metrics.leadsQualified} icon={<Users className="h-5 w-5" />} />
                <MetricCard title="Visitas agendadas" value={ai.metrics.visitsScheduled} icon={<CalendarDays className="h-5 w-5" />} />
                <MetricCard title="Transferências" value={ai.metrics.handoffs} icon={<ArrowLeftRight className="h-5 w-5" />} />
                <MetricCard title="Resp. média" value={`${ai.metrics.avgResponseSeconds}s`} icon={<Timer className="h-5 w-5" />} />
              </div>
            </>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}
