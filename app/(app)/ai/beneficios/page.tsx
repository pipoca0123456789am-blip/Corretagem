'use client'

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { AiPageState, useAiLoad } from '@/components/ai-agent/shared'
import { AI_INTEGRATION_PRICE, AI_PRICE_PROVISIONAL, aiBenefits, aiCapabilities, formatCurrency } from '@/lib/phase13-data'

export default function AiBenefitsPage() {
  const { state, reload } = useAiLoad()
  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Benefícios' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Benefícios</h1>
          <p className="text-sm text-muted-foreground">
            Integração sugerida por {formatCurrency(AI_INTEGRATION_PRICE)}
            {AI_PRICE_PROVISIONAL ? ' (valor provisório)' : ''}
          </p>
        </div>
        <AiPageState state={state} onRetry={reload}>
          <div className="grid gap-3 sm:grid-cols-2">
            {aiBenefits.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Capacidades apresentadas</h2>
            <div className="flex flex-wrap gap-2">
              {aiCapabilities.map((item) => (
                <Badge key={item} variant="default">{item}</Badge>
              ))}
            </div>
          </div>
          <Link href="/ai/solicitar"><Button>Solicitar integração</Button></Link>
        </AiPageState>
      </div>
    </div>
  )
}
