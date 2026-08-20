'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/design-system/feedback/badge'
import { Button } from '@/components/design-system/buttons/button'
import { AiPageState, SuccessNote, useAiLoad } from '@/components/ai-agent/shared'
import { AiIntegration, getRealtorAi, upsertAi } from '@/lib/phase13-data'

export default function AiAlertsPage() {
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [success, setSuccess] = useState('')

  useEffect(() => setAi(getRealtorAi()), [state])

  const resolve = (alertId: string) => {
    if (!ai) return
    const alerts = ai.alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    upsertAi({ ...ai, alerts })
    setAi(getRealtorAi())
    setSuccess('Alerta marcado como resolvido.')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Alertas' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Falhas e alertas</h1>
          <p className="text-sm text-muted-foreground">Monitoramento simulado do seu agente</p>
        </div>
        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        <AiPageState
          state={state === 'ready' && (!ai || ai.alerts.length === 0) ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Nenhum alerta', description: 'Quando houver falhas ou avisos, eles aparecerão aqui.' }}
        >
          {ai ? (
            <div className="space-y-3">
              {ai.alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{alert.title}</p>
                        <Badge
                          variant={
                            alert.level === 'critical'
                              ? 'destructive'
                              : alert.level === 'warning'
                                ? 'warning'
                                : 'info'
                          }
                        >
                          {alert.level}
                        </Badge>
                        {alert.resolved ? <Badge variant="success">Resolvido</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{alert.detail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{alert.at}</p>
                    </div>
                    {!alert.resolved ? (
                      <Button size="sm" variant="outline" onClick={() => resolve(alert.id)}>
                        Resolver
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}
