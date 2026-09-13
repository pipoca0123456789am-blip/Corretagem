'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { MetricCard } from '@/components/design-system/cards/metric-card'

const events: { id: string; actor: string; action: string; at: string; level: string }[] = []

export default function AuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/paineladmin' }, { label: 'Auditoria' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Log de auditoria</h1>
          <p className="text-sm text-muted-foreground">Histórico simulado de ações sensíveis na plataforma</p>
        </div>
        <Alert variant="info" description="Sem backend real. Eventos ficam vazios até haver operação registrada." />
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard title="Eventos hoje" value={0} />
          <MetricCard title="Críticos" value={0} />
          <MetricCard title="Avisos" value={0} />
        </div>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{e.action}</p>
                  <Badge variant={e.level === 'critical' ? 'destructive' : e.level === 'warning' ? 'warning' : 'info'}>
                    {e.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {e.actor} · {e.at}
                </p>
              </div>
            ))
          )}
        </div>
        <Link href="/admin/support"><Button variant="outline">Ir para suporte</Button></Link>
      </div>
    </div>
  )
}
