'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { AI_INTEGRATION_PRICE, AI_PRICE_PROVISIONAL, formatCurrency } from '@/lib/phase13-data'

export default function IntegrationsPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Integrações' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
          <p className="mt-1 text-muted-foreground">Conecte canais e automações à sua operação</p>
        </div>

        <Alert
          variant="info"
          description="Integrações reais não estão habilitadas. A IA + WhatsApp é uma simulação isolada por corretor."
        />

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">IA individual + WhatsApp</h2>
            {AI_PRICE_PROVISIONAL ? <Badge variant="info">Valor provisório</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Agente treinado só com seus dados, imóveis e tom de voz. Valor sugerido{' '}
            {formatCurrency(AI_INTEGRATION_PRICE)}.
          </p>
          <Link href="/ai" className="mt-4 inline-block">
            <Button>Abrir módulo de IA</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
