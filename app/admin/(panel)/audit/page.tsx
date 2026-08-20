'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { MetricCard } from '@/components/design-system/cards/metric-card'

const events = [
  { id: 'a1', actor: 'Carlos Eduardo Silva', action: 'Abriu chamado de pagamento', at: '27/07/2026 10:05', level: 'info' },
  { id: 'a2', actor: 'Ana Suporte', action: 'Alterou status do chamado tk-1001', at: '27/07/2026 10:40', level: 'info' },
  { id: 'a3', actor: 'Marina Costa Santos', action: 'Solicitou ativação de IA', at: '22/07/2026 11:30', level: 'warning' },
  { id: 'a4', actor: 'Sistema', action: 'Assinatura marcada como inadimplente', at: '21/07/2026 08:00', level: 'critical' },
  { id: 'a5', actor: 'Admin', action: 'Editou plano Profissional (preço provisório)', at: '20/07/2026 16:12', level: 'warning' },
]

export default function AuditPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Auditoria' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Log de auditoria</h1>
          <p className="text-sm text-muted-foreground">Histórico simulado de ações sensíveis na plataforma</p>
        </div>
        <Alert variant="info" description="Sem backend real. Eventos fictícios para demonstração de governança." />
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard title="Eventos hoje" value={3421} />
          <MetricCard title="Críticos" value={2} />
          <MetricCard title="Avisos" value={14} />
        </div>
        <div className="space-y-3">
          {events.map((e) => (
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
          ))}
        </div>
        <Link href="/admin/support"><Button variant="outline">Ir para suporte</Button></Link>
      </div>
    </div>
  )
}
