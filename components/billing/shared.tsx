'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/design-system/feedback/badge'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { Button } from '@/components/design-system/buttons/button'
import {
  PLAN_PRICES_PROVISIONAL,
  PaymentStatus,
  SaaSPlan,
  formatCurrency,
  limitLabel,
  paymentStatusBadge,
  paymentStatusLabels,
} from '@/lib/phase14-data'

export function useBillingLoad(delay = 250) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const reload = () => {
    setState('loading')
    window.setTimeout(() => setState('ready'), delay)
  }
  return { state, reload, setState }
}

export function BillingState({
  state,
  onRetry,
  empty,
  children,
}: {
  state: 'loading' | 'ready' | 'error' | 'empty'
  onRetry?: () => void
  empty?: { title: string; description?: string; action?: { label: string; onClick: () => void } }
  children: React.ReactNode
}) {
  if (state === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (state === 'error') {
    return (
      <EmptyState
        title="Falha ao carregar"
        description="Tente novamente."
        action={onRetry ? { label: 'Tentar de novo', onClick: onRetry } : undefined}
      />
    )
  }
  if (state === 'empty' && empty) {
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />
  }
  return <>{children}</>
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentStatusBadge[status]}>{paymentStatusLabels[status]}</Badge>
}

export function ProvisionalBadge() {
  return <Badge variant="info">Preço provisório</Badge>
}

export function PlanCard({
  plan,
  current,
  ctaLabel,
  onSelect,
  billingCycle = 'mensal',
}: {
  plan: SaaSPlan
  current?: boolean
  ctaLabel?: string
  onSelect?: () => void
  billingCycle?: 'mensal' | 'anual'
}) {
  const price = billingCycle === 'anual' ? plan.yearlyPrice : plan.monthlyPrice
  const period = billingCycle === 'anual' ? '/ano' : '/mês'
  const equiv =
    billingCycle === 'anual'
      ? Math.round((plan.yearlyPrice / 12) * 100) / 100
      : null

  return (
    <div
      className={`flex h-full flex-col rounded-2xl border bg-card p-5 ${
        plan.recommended || plan.popular ? 'border-primary shadow-md' : 'border-border'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        {plan.recommended ? <Badge variant="primary">Recomendado</Badge> : null}
        {!plan.recommended && plan.popular ? <Badge variant="primary">Mais escolhido</Badge> : null}
        {current ? <Badge variant="success">Plano atual</Badge> : null}
      </div>
      <p className="text-sm text-muted-foreground">{plan.tagline}</p>
      <div className="mt-4">
        <p className="text-3xl font-bold text-primary">{formatCurrency(price)}</p>
        <p className="text-xs text-muted-foreground">{period}</p>
        {equiv !== null ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Equivale a {formatCurrency(equiv)}/mês
          </p>
        ) : null}
        {(plan.provisional || PLAN_PRICES_PROVISIONAL) && (
          <div className="mt-2">
            <ProvisionalBadge />
          </div>
        )}
      </div>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
        <li>• Imóveis: {limitLabel(plan.propertyLimit)}</li>
        <li>• Usuários: {limitLabel(plan.userLimit)}</li>
        <li>• Campanhas: {limitLabel(plan.campaignLimit)}</li>
        {plan.highlights.map((h) => (
          <li key={h}>• {h}</li>
        ))}
      </ul>
      {onSelect ? (
        <Button className="mt-5 w-full" variant={plan.recommended || plan.popular ? 'primary' : 'outline'} onClick={onSelect}>
          {ctaLabel || 'Selecionar'}
        </Button>
      ) : (
        <Link href={`/plans/checkout?plano=${plan.id}&ciclo=${billingCycle}`} className="mt-5 block">
          <Button className="w-full" variant={plan.recommended || plan.popular ? 'primary' : 'outline'}>
            {ctaLabel || 'Contratar'}
          </Button>
        </Link>
      )}
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="tertiary" onClick={onClose}>
            Voltar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SuccessAlert({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert className="mb-4" variant="success" description={message} onClose={onClose} />
}
