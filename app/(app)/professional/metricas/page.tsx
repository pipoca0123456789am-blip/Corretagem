'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Alert } from '@/components/design-system/feedback/alert'
import { Phase12State, useUiLoad } from '@/components/professional/shared'
import {
  ProfessionalRequest,
  getRealtorProfessionalRequest,
} from '@/lib/phase12-data'
import { Eye, MessageCircle, Target, Users } from 'lucide-react'

export default function ProfessionalMetricsPage() {
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)

  useEffect(() => {
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  const metrics = request?.metrics

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Métricas' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Métricas</h1>
          <p className="text-sm text-muted-foreground">Desempenho simulado da sua página profissional</p>
        </div>
        <Phase12State
          state={state === 'ready' && !metrics ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Métricas indisponíveis',
            description: 'Disponíveis após a publicação da página.',
          }}
        >
          {metrics ? (
            <>
              <Alert variant="info" description={`Período: ${metrics.periodLabel}. Dados fictícios para demonstração.`} />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Visitas" value={metrics.visits} icon={<Eye className="h-5 w-5" />} />
                <MetricCard title="Leads" value={metrics.leads} icon={<Users className="h-5 w-5" />} />
                <MetricCard title="Cliques WhatsApp" value={metrics.whatsappClicks} icon={<MessageCircle className="h-5 w-5" />} />
                <MetricCard title="Conversão" value={`${metrics.conversionRate}%`} icon={<Target className="h-5 w-5" />} />
              </div>
            </>
          ) : null}
        </Phase12State>
      </div>
    </div>
  )
}
