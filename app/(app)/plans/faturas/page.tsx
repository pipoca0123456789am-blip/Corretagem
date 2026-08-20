'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { BillingState, PaymentBadge, useBillingLoad } from '@/components/billing/shared'
import { Invoice, formatCurrency, getRealtorInvoices } from '@/lib/phase14-data'

export default function InvoicesPage() {
  const { state, reload } = useBillingLoad()
  const [list, setList] = useState<Invoice[]>([])

  useEffect(() => {
    setList(getRealtorInvoices())
  }, [state])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planos', href: '/plans' }, { label: 'Faturas' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faturas</h1>
          <p className="text-sm text-muted-foreground">Emissão e cobrança são simuladas</p>
        </div>
        <BillingState
          state={state === 'ready' && list.length === 0 ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Nenhuma fatura', description: 'Quando houver cobranças, elas aparecerão aqui.' }}
        >
          <div className="space-y-3">
            {list.map((inv) => (
              <div key={inv.id} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-foreground">{inv.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {inv.id} · vencimento {inv.dueDate}
                    {inv.paidAt ? ` · pago em ${inv.paidAt}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-primary">{formatCurrency(inv.amount)}</p>
                  <PaymentBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        </BillingState>
      </div>
    </div>
  )
}
