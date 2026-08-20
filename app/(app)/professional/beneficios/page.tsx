'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Phase12State, useUiLoad } from '@/components/professional/shared'
import { benefitsList, formatCurrency, PROFESSIONAL_PAGE_PRICE } from '@/lib/phase12-data'
import { CheckCircle2 } from 'lucide-react'

export default function ProfessionalBenefitsPage() {
  const { state, reload } = useUiLoad()
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Benefícios' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Benefícios</h1>
          <p className="text-sm text-muted-foreground">
            Tudo incluso no investimento de {formatCurrency(PROFESSIONAL_PAGE_PRICE)}
          </p>
        </div>
        <Phase12State state={state} onRetry={reload}>
          <div className="grid gap-3 sm:grid-cols-2">
            {benefitsList.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p className="text-sm text-foreground">{item}</p>
              </div>
            ))}
          </div>
          <Link href="/professional/solicitar">
            <Button className="mt-2">Iniciar solicitação</Button>
          </Link>
        </Phase12State>
      </div>
    </div>
  )
}
