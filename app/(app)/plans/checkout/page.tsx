'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { BillingState, ProvisionalBadge, SuccessAlert, useBillingLoad } from '@/components/billing/shared'
import {
  BillingCycle,
  PlanId,
  TRIAL_DAYS,
  applyCoupon,
  formatCurrency,
  getCurrentRealtorId,
  getPlan,
  getRealtorSubscription,
  loadPlans,
  normalizePlanId,
  upsertSubscription,
} from '@/lib/phase14-data'
import { publicRealtorProfiles } from '@/lib/phase9-data'

export default function PlansCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando checkout...</div>}>
      <PlansCheckoutInner />
    </Suspense>
  )
}

function PlansCheckoutInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { state } = useBillingLoad()
  const realtorId = getCurrentRealtorId() || 1
  const profile = publicRealtorProfiles.find((p) => p.id === realtorId)
  const initialPlan = normalizePlanId(params.get('plano') || 'profissional')
  const isTrial = params.get('trial') === '1'
  const initialCycle = (params.get('ciclo') as BillingCycle) === 'anual' ? 'anual' : 'mensal'

  const [planId, setPlanId] = useState<PlanId>(initialPlan)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialCycle)
  const [coupon, setCoupon] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [discounted, setDiscounted] = useState<number | null>(null)
  const [method, setMethod] = useState('pix')
  const [cardName, setCardName] = useState(profile?.name || '')
  const [accept, setAccept] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPlanId(initialPlan)
    setBillingCycle(initialCycle)
  }, [initialPlan, initialCycle])

  const plan = useMemo(() => getPlan(planId, loadPlans()), [planId])
  const baseAmount =
    billingCycle === 'anual' ? plan?.yearlyPrice || 0 : plan?.monthlyPrice || 0
  const amount = discounted ?? baseAmount

  const applyCode = () => {
    const result = applyCoupon(coupon, baseAmount)
    setCouponMsg(result.message)
    setDiscounted(result.ok ? result.amount : null)
  }

  const confirm = () => {
    if (!plan || !accept) {
      setError('Aceite os termos para continuar.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      const existing = getRealtorSubscription(realtorId)
      const renews = new Date()
      renews.setDate(renews.getDate() + (isTrial ? TRIAL_DAYS : billingCycle === 'anual' ? 365 : 30))
      upsertSubscription({
        id: existing?.id || `sub-${Date.now()}`,
        realtorId,
        realtorName: profile?.name || 'Corretor',
        planId: plan.id,
        status: isTrial ? 'trial' : 'ativa',
        paymentStatus: isTrial ? 'pendente' : 'aprovado',
        billingCycle: isTrial ? 'mensal' : billingCycle,
        startedAt: existing?.startedAt || new Date().toISOString().slice(0, 10),
        renewsAt: renews.toISOString().slice(0, 10),
        trialEndsAt: isTrial ? renews.toISOString().slice(0, 10) : undefined,
        couponCode: discounted !== null ? coupon.toUpperCase() : undefined,
        propertiesUsed: existing?.propertiesUsed || 0,
        usersUsed: existing?.usersUsed || 1,
        campaignsUsed: existing?.campaignsUsed || 0,
        addons: existing?.addons || [],
        history: [
          {
            id: `h-${Date.now()}`,
            label: isTrial
              ? `Teste gratuito iniciado (${TRIAL_DAYS} dias) — ${plan.name}`
              : `Checkout simulado — ${plan.name} (${formatCurrency(amount)}/${billingCycle === 'anual' ? 'ano' : 'mês'})`,
            at: new Date().toLocaleString('pt-BR'),
          },
          ...(existing?.history || []),
        ],
      })
      setSuccess('Pedido confirmado visualmente.')
      setLoading(false)
      setTimeout(() => router.push('/plans/confirmacao'), 700)
    }, 800)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Planos', href: '/plans' }, { label: 'Checkout' }]} />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout visual</h1>
          <p className="text-sm text-muted-foreground">Sem cobrança recorrente real</p>
        </div>
        {success ? <SuccessAlert message={success} /> : null}
        {error ? <Alert variant="destructive" description={error} /> : null}

        <BillingState state={state}>
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            {isTrial ? (
              <Alert
                variant="success"
                title="Teste gratuito"
                description={`${TRIAL_DAYS} dias simulados — sem pagamento agora. Acesso ao Profissional.`}
              />
            ) : null}

            <Select
              label="Plano"
              value={planId}
              onChange={(e) => {
                setPlanId(normalizePlanId(e.target.value))
                setDiscounted(null)
                setCouponMsg('')
              }}
              options={loadPlans().filter((p) => p.active).map((p) => ({
                value: p.id,
                label: `${p.name} — ${formatCurrency(p.monthlyPrice)}/mês`,
              }))}
            />

            {!isTrial ? (
              <Select
                label="Ciclo de cobrança"
                value={billingCycle}
                onChange={(e) => {
                  setBillingCycle(e.target.value as BillingCycle)
                  setDiscounted(null)
                  setCouponMsg('')
                }}
                options={[
                  { value: 'mensal', label: 'Mensal' },
                  { value: 'anual', label: 'Anual' },
                ]}
              />
            ) : null}

            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">Resumo</p>
                <ProvisionalBadge />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan?.name}</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(amount)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{isTrial || billingCycle === 'mensal' ? 'mês' : 'ano'}
                </span>
              </p>
              {discounted !== null ? (
                <p className="text-xs text-muted-foreground line-through">{formatCurrency(baseAmount)}</p>
              ) : null}
            </div>

            {!isTrial ? (
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input label="Cupom" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                  <Button className="sm:mt-7" variant="outline" onClick={applyCode}>
                    Aplicar
                  </Button>
                </div>
                {couponMsg ? <p className="text-xs text-muted-foreground">{couponMsg}</p> : null}

                <Select
                  label="Dados de pagamento (simulado)"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  options={[
                    { value: 'pix', label: 'Pix' },
                    { value: 'card', label: 'Cartão' },
                    { value: 'boleto', label: 'Boleto' },
                  ]}
                />
                {method === 'card' ? (
                  <Input label="Nome no cartão" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                ) : null}
              </>
            ) : null}

            <Checkbox
              checked={accept}
              onCheckedChange={setAccept}
              label="Concordo com os termos de uso e a política de cobrança simulada"
            />

            <Button className="w-full" isLoading={loading} onClick={confirm}>
              {isTrial ? 'Confirmar teste gratuito' : 'Confirmar contratação'}
            </Button>
            <Link href="/plans" className="block text-center text-sm text-primary">
              Voltar à comparação
            </Link>
          </div>
        </BillingState>
      </div>
    </div>
  )
}
