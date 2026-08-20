'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Progress } from '@/components/design-system/feedback/progress'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  BillingState,
  ConfirmDialog,
  PaymentBadge,
  ProvisionalBadge,
  SuccessAlert,
  useBillingLoad,
} from '@/components/billing/shared'
import {
  DOWNGRADE_GRACE_DAYS,
  PlanId,
  Subscription,
  completeGraceDowngrade,
  formatCurrency,
  getEffectivePlanId,
  getPlan,
  getRealtorSubscription,
  getTrialDaysRemaining,
  limitLabel,
  loadPlans,
  simulateDowngrade,
  simulateUpgrade,
  subscriptionStatusLabels,
  usagePercent,
  upsertSubscription,
} from '@/lib/phase14-data'

const PLAN_ORDER: PlanId[] = ['essencial', 'profissional', 'premium']

export default function CurrentPlanPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando...</div>}>
      <CurrentPlanInner />
    </Suspense>
  )
}

function CurrentPlanInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { state, reload } = useBillingLoad()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [success, setSuccess] = useState('')
  const [confirm, setConfirm] = useState<'cancel' | 'reactivate' | 'downgrade' | null>(null)
  const [pendingDown, setPendingDown] = useState<PlanId | null>(null)

  useEffect(() => {
    setSub(getRealtorSubscription())
    const dg = params.get('downgrade') as PlanId | null
    if (dg && PLAN_ORDER.includes(dg)) {
      setPendingDown(dg)
      setConfirm('downgrade')
    }
  }, [state, params])

  const effectiveId = sub ? getEffectivePlanId(sub) : null
  const plan = effectiveId ? getPlan(effectiveId, loadPlans()) : null
  const trialDays = getTrialDaysRemaining(sub)

  const runUpgrade = () => {
    if (!sub) return
    const idx = PLAN_ORDER.indexOf(sub.planId)
    const nextId = PLAN_ORDER[Math.min(idx + 1, PLAN_ORDER.length - 1)]
    if (nextId === sub.planId) {
      router.push('/plans')
      return
    }
    simulateUpgrade(nextId)
    setSuccess(`Upgrade simulado para ${getPlan(nextId)?.name}.`)
    setSub(getRealtorSubscription())
    reload()
  }

  const runDowngrade = () => {
    if (!sub) return
    const idx = PLAN_ORDER.indexOf(sub.planId)
    const nextId = pendingDown || PLAN_ORDER[Math.max(idx - 1, 0)]
    if (nextId === sub.planId) return
    simulateDowngrade(nextId)
    setConfirm(null)
    setPendingDown(null)
    setSuccess(
      `Downgrade solicitado. Período de adequação de ${DOWNGRADE_GRACE_DAYS} dias até ${getPlan(nextId)?.name}.`
    )
    setSub(getRealtorSubscription())
    reload()
  }

  const finishGrace = () => {
    completeGraceDowngrade()
    setSuccess('Adequação concluída — plano inferior aplicado.')
    setSub(getRealtorSubscription())
    reload()
  }

  const cancel = () => {
    if (!sub) return
    upsertSubscription({
      ...sub,
      status: 'cancelada',
      canceledAt: new Date().toISOString().slice(0, 10),
      history: [
        { id: `h-${Date.now()}`, label: 'Cancelamento solicitado (simulado)', at: new Date().toLocaleString('pt-BR') },
        ...sub.history,
      ],
    })
    setConfirm(null)
    setSuccess('Assinatura cancelada visualmente.')
    setSub(getRealtorSubscription())
  }

  const reactivate = () => {
    if (!sub) return
    upsertSubscription({
      ...sub,
      status: 'ativa',
      paymentStatus: 'aprovado',
      canceledAt: undefined,
      history: [
        { id: `h-${Date.now()}`, label: 'Reativação simulada', at: new Date().toLocaleString('pt-BR') },
        ...sub.history,
      ],
    })
    setConfirm(null)
    setSuccess('Assinatura reativada.')
    setSub(getRealtorSubscription())
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planos', href: '/plans' }, { label: 'Plano atual' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plano atual</h1>
          <p className="text-sm text-muted-foreground">Uso dos limites, upgrade, downgrade e renovação</p>
        </div>
        {success ? <SuccessAlert message={success} onClose={() => setSuccess('')} /> : null}

        <BillingState
          state={!sub && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Sem assinatura',
            description: 'Escolha um plano para começar.',
            action: { label: 'Ver planos', onClick: () => router.push('/plans') },
          }}
        >
          {sub && plan ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                  <Badge variant="primary">{subscriptionStatusLabels[sub.status]}</Badge>
                  <PaymentBadge status={sub.paymentStatus} />
                  <ProvisionalBadge />
                </div>
                <p className="text-sm text-muted-foreground">
                  {sub.billingCycle === 'anual'
                    ? `${formatCurrency(plan.yearlyPrice)}/ano`
                    : `${formatCurrency(plan.monthlyPrice)}/mês`}{' '}
                  · renovação em {sub.renewsAt}
                </p>
                {sub.status === 'trial' ? (
                  <Alert
                    variant="info"
                    title="Período de teste"
                    description={`${trialDays} dia(s) restante(s). Acesso efetivo ao Profissional até ${sub.trialEndsAt}.`}
                  />
                ) : null}
                {sub.status === 'adequacao' && sub.graceUntil ? (
                  <Alert
                    variant="warning"
                    title="Período de adequação"
                    description={`Downgrade pendente para ${getPlan(sub.pendingPlanId || 'essencial')?.name}. Adeque o uso até ${sub.graceUntil}.`}
                  />
                ) : null}
                {sub.status === 'limitado' ? (
                  <Alert
                    variant="warning"
                    title="Acesso limitado"
                    description="O trial encerrou. Contrate um plano para liberar recursos avançados."
                  />
                ) : null}
                {sub.status === 'inadimplente' ? (
                  <Alert variant="warning" title="Inadimplência" description="Regularize a fatura para evitar suspensão." />
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={runUpgrade}>Simular upgrade</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPendingDown(null)
                      setConfirm('downgrade')
                    }}
                  >
                    Simular downgrade
                  </Button>
                  {sub.status === 'adequacao' ? (
                    <Button variant="secondary" onClick={finishGrace}>
                      Concluir adequação
                    </Button>
                  ) : null}
                  <Link href="/plans/checkout">
                    <Button variant="secondary">Renovar / checkout</Button>
                  </Link>
                  <Link href="/plans">
                    <Button variant="outline">Ver planos</Button>
                  </Link>
                  {sub.status === 'cancelada' ? (
                    <Button variant="outline" onClick={() => setConfirm('reactivate')}>
                      Reativar
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={() => setConfirm('cancel')}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">Uso dos limites</h3>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Imóveis: {sub.propertiesUsed} / {limitLabel(plan.propertyLimit)}
                  </p>
                  <Progress value={usagePercent(sub.propertiesUsed, plan.propertyLimit)} showPercentage={false} />
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Usuários: {sub.usersUsed} / {limitLabel(plan.userLimit)}
                  </p>
                  <Progress value={usagePercent(sub.usersUsed, plan.userLimit)} showPercentage={false} />
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    Campanhas: {sub.campaignsUsed} / {limitLabel(plan.campaignLimit)}
                  </p>
                  <Progress value={usagePercent(sub.campaignsUsed, plan.campaignLimit)} showPercentage={false} />
                </div>
                {sub.addons?.length ? (
                  <div>
                    <p className="mb-1 text-sm font-medium text-foreground">Add-ons ativos</p>
                    <ul className="text-sm text-muted-foreground">
                      {sub.addons.map((a) => (
                        <li key={a.id}>
                          • {a.name} — {formatCurrency(a.price)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Link href="/plans/faturas">
                    <Button size="sm" variant="outline">
                      Faturas
                    </Button>
                  </Link>
                  <Link href="/plans/historico">
                    <Button size="sm" variant="outline">
                      Histórico
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </BillingState>

        <ConfirmDialog
          open={confirm === 'cancel'}
          title="Cancelar assinatura?"
          description="Você perderá acesso aos recursos do plano ao fim do ciclo simulado. Confirme para continuar."
          confirmLabel="Confirmar cancelamento"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={cancel}
        />
        <ConfirmDialog
          open={confirm === 'reactivate'}
          title="Reativar assinatura?"
          description="A assinatura voltará ao status ativo (simulado)."
          confirmLabel="Reativar"
          onClose={() => setConfirm(null)}
          onConfirm={reactivate}
        />
        <ConfirmDialog
          open={confirm === 'downgrade'}
          title="Simular downgrade?"
          description={`Você terá ${DOWNGRADE_GRACE_DAYS} dias de adequação antes do plano inferior ser aplicado.`}
          confirmLabel="Confirmar downgrade"
          onClose={() => {
            setConfirm(null)
            setPendingDown(null)
          }}
          onConfirm={runDowngrade}
        />
      </div>
    </div>
  )
}
