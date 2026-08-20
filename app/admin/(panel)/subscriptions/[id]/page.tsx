'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { isSuperAdmin } from '@/lib/auth'
import {
  BillingState,
  ConfirmDialog,
  PaymentBadge,
  SuccessAlert,
  useBillingLoad,
} from '@/components/billing/shared'
import {
  Subscription,
  SubscriptionStatus,
  formatCurrency,
  getPlan,
  loadPlans,
  loadSubscriptions,
  subscriptionStatusLabels,
  upsertSubscription,
} from '@/lib/phase14-data'

export default function AdminSubscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useBillingLoad()
  const [allowed, setAllowed] = useState(false)
  const [sub, setSub] = useState<Subscription | null>(null)
  const [success, setSuccess] = useState('')
  const [confirm, setConfirm] = useState<'suspend' | 'cancel' | null>(null)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setSub(loadSubscriptions().find((s) => s.id === id) || null)
  }, [id, router, state])

  if (!allowed) return null

  const plan = sub ? getPlan(sub.planId, loadPlans()) : null

  const applyStatus = (status: SubscriptionStatus, note: string) => {
    if (!sub) return
    const next = {
      ...sub,
      status,
      canceledAt: status === 'cancelada' ? new Date().toISOString().slice(0, 10) : sub.canceledAt,
      history: [
        { id: `h-${Date.now()}`, label: note, at: new Date().toLocaleString('pt-BR') },
        ...sub.history,
      ],
    }
    upsertSubscription(next)
    setSub(next)
    setSuccess(note)
    setConfirm(null)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Assinaturas', href: '/admin/subscriptions' },
          { label: id },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        {success ? <SuccessAlert message={success} onClose={() => setSuccess('')} /> : null}
        <BillingState
          state={state === 'ready' && !sub ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Assinatura não encontrada' }}
        >
          {sub && plan ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{sub.realtorName}</h1>
                    <Badge variant="primary">{subscriptionStatusLabels[sub.status]}</Badge>
                    <PaymentBadge status={sub.paymentStatus} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.name} · {formatCurrency(plan.monthlyPrice)}/mês · {sub.id}
                  </p>
                </div>
                <Link href="/admin/subscriptions"><Button variant="outline">Voltar</Button></Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">Gestão</h2>
                  <Select
                    label="Status"
                    value={sub.status}
                    onChange={(e) => setSub({ ...sub, status: e.target.value as SubscriptionStatus })}
                    options={Object.entries(subscriptionStatusLabels).map(([value, label]) => ({ value, label }))}
                  />
                  <Button
                    onClick={() => {
                      upsertSubscription(sub)
                      setSuccess('Assinatura atualizada.')
                    }}
                  >
                    Salvar
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setConfirm('suspend')}>Suspender</Button>
                    <Button variant="danger" onClick={() => setConfirm('cancel')}>Cancelar</Button>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Histórico</h2>
                  <ul className="space-y-2 text-sm">
                    {sub.history.map((h) => (
                      <li key={h.id} className="border-b border-border py-2">
                        <p>{h.label}</p>
                        <p className="text-xs text-muted-foreground">{h.at}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Alert variant="info" description="Sem cobrança recorrente real nem emissão real de faturas." />
            </>
          ) : null}
        </BillingState>

        <ConfirmDialog
          open={confirm === 'suspend'}
          title="Suspender assinatura?"
          description="O corretor ficará com acesso limitado até reativação."
          confirmLabel="Suspender"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => applyStatus('suspensa', 'Suspensa pelo Super Admin')}
        />
        <ConfirmDialog
          open={confirm === 'cancel'}
          title="Cancelar assinatura?"
          description="Confirmação necessária. Ação simulada."
          confirmLabel="Cancelar assinatura"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => applyStatus('cancelada', 'Cancelada pelo Super Admin')}
        />
      </div>
    </div>
  )
}
