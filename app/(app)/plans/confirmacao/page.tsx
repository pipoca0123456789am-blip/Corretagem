'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'

export default function PlansConfirmationPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planos', href: '/plans' }, { label: 'Confirmação' }]} />
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <Alert
          variant="success"
          title="Confirmação registrada"
          description="Sua assinatura foi atualizada visualmente. Não houve cobrança real."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/plans/atual"><Button>Ver plano atual</Button></Link>
          <Link href="/plans/faturas"><Button variant="outline">Faturas</Button></Link>
        </div>
      </div>
    </div>
  )
}
