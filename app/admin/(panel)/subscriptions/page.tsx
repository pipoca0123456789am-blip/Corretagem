'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { isSuperAdmin } from '@/lib/auth'
import {
  BillingState,
  PaymentBadge,
  ProvisionalBadge,
  SuccessAlert,
  useBillingLoad,
} from '@/components/billing/shared'
import {
  Coupon,
  PLAN_PRICES_PROVISIONAL,
  SaaSPlan,
  Subscription,
  formatCurrency,
  getPlan,
  loadCoupons,
  loadPlans,
  loadSubscriptions,
  saveCoupons,
  savePlans,
  subscriptionStatusLabels,
} from '@/lib/phase14-data'

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { state, reload } = useBillingLoad()
  const [allowed, setAllowed] = useState(false)
  const [tab, setTab] = useState<'assinaturas' | 'planos' | 'cupons' | 'metricas'>('assinaturas')
  const [subs, setSubs] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<SaaSPlan[]>([])
  const [couponList, setCouponList] = useState<Coupon[]>([])
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [success, setSuccess] = useState('')
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setSubs(loadSubscriptions())
    setPlans(loadPlans())
    setCouponList(loadCoupons())
  }, [router, state])

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      const matchStatus = status === 'all' || s.status === status
      const q = search.toLowerCase()
      const matchSearch = !q || s.realtorName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [subs, status, search])

  const activeCount = subs.filter((s) => s.status === 'ativa' || s.status === 'trial').length
  const delinquent = subs.filter((s) => s.status === 'inadimplente').length
  const canceled = subs.filter((s) => s.status === 'cancelada').length
  const mrr = subs
    .filter((s) => s.status === 'ativa')
    .reduce((sum, s) => sum + (getPlan(s.planId, plans)?.monthlyPrice || 0), 0)

  if (!allowed) return null

  const savePlanEdit = () => {
    if (!editingPlan) return
    const next = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p))
    setPlans(next)
    savePlans(next)
    setEditingPlan(null)
    setSuccess('Plano atualizado (preço permanece provisório).')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Assinaturas' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Planos, assinaturas e pagamentos</h1>
            <p className="text-sm text-muted-foreground">Visão global do Super Admin</p>
          </div>
          {PLAN_PRICES_PROVISIONAL ? <ProvisionalBadge /> : null}
        </div>

        {success ? <SuccessAlert message={success} onClose={() => setSuccess('')} /> : null}

        <div className="flex flex-wrap gap-2">
          {([
            ['assinaturas', 'Assinaturas'],
            ['planos', 'Planos'],
            ['cupons', 'Cupons'],
            ['metricas', 'Métricas'],
          ] as const).map(([id, label]) => (
            <Button key={id} size="sm" variant={tab === id ? 'primary' : 'outline'} onClick={() => setTab(id)}>
              {label}
            </Button>
          ))}
        </div>

        <BillingState state={state} onRetry={reload}>
          {tab === 'metricas' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Assinaturas ativas/trial" value={activeCount} />
              <MetricCard title="Inadimplência" value={delinquent} />
              <MetricCard title="Cancelamentos" value={canceled} />
              <MetricCard title="MRR simulado" value={formatCurrency(mrr)} description="Preços provisórios" />
            </div>
          ) : null}

          {tab === 'assinaturas' ? (
            <>
              <Alert variant="info" description="Cada corretor vê apenas a própria assinatura. Aqui você vê todas." />
              <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                <Input placeholder="Buscar corretor ou ID" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    ...Object.entries(subscriptionStatusLabels).map(([value, label]) => ({ value, label })),
                  ]}
                />
              </div>
              <div className="space-y-3">
                {filtered.map((s) => {
                  const plan = getPlan(s.planId, plans)
                  return (
                    <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{s.realtorName}</p>
                          <Badge variant="primary">{subscriptionStatusLabels[s.status]}</Badge>
                          <PaymentBadge status={s.paymentStatus} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan?.name} · {formatCurrency(plan?.monthlyPrice || 0)}/mês · renova {s.renewsAt}
                        </p>
                      </div>
                      <Link href={`/admin/subscriptions/${s.id}`}>
                        <Button size="sm">Detalhes</Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}

          {tab === 'planos' ? (
            <div className="space-y-4">
              <Alert variant="warning" title="Edição de preços" description="Valores mensais são provisórios e não finais." />
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-border bg-card p-4">
                  {editingPlan?.id === plan.id ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label="Nome" value={editingPlan.name} onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} />
                      <Input
                        label="Preço mensal (R$)"
                        type="number"
                        value={String(editingPlan.monthlyPrice)}
                        onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) || 0 })}
                      />
                      <Input label="Tagline" value={editingPlan.tagline} onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })} />
                      <Select
                        label="Status"
                        value={editingPlan.active ? '1' : '0'}
                        onChange={(e) => setEditingPlan({ ...editingPlan, active: e.target.value === '1' })}
                        options={[
                          { value: '1', label: 'Ativo' },
                          { value: '0', label: 'Suspenso' },
                        ]}
                      />
                      <div className="flex gap-2 sm:col-span-2">
                        <Button onClick={savePlanEdit}>Salvar</Button>
                        <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-foreground">{plan.name}</p>
                          <Badge variant={plan.active ? 'success' : 'destructive'}>
                            {plan.active ? 'Ativo' : 'Suspenso'}
                          </Badge>
                          <ProvisionalBadge />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(plan.monthlyPrice)}/mês · imóveis {String(plan.propertyLimit)} · usuários{' '}
                          {String(plan.userLimit)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setEditingPlan(plan)}>
                        Editar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'cupons' ? (
            <div className="space-y-3">
              {couponList.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div>
                    <p className="font-semibold text-foreground">{c.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.discountPercent}% · {c.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const next = couponList.map((x) =>
                        x.id === c.id ? { ...x, active: !x.active } : x
                      )
                      setCouponList(next)
                      saveCoupons(next)
                      setSuccess(`Cupom ${c.code} ${c.active ? 'desativado' : 'ativado'}.`)
                    }}
                  >
                    {c.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </BillingState>
      </div>
    </div>
  )
}
