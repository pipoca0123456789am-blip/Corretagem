'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { BillingState, PlanCard, ProvisionalBadge, SuccessAlert, useBillingLoad } from '@/components/billing/shared'
import {
  BillingCycle,
  PLAN_PRICES_PROVISIONAL,
  SaaSPlan,
  TRIAL_DAYS,
  addOnProducts,
  featureLabel,
  formatCurrency,
  getEffectivePlanId,
  getEquivalentMonthly,
  getRealtorSubscription,
  getTrialDaysRemaining,
  getYearlySavings,
  limitLabel,
  loadPlans,
  startTrial,
} from '@/lib/phase14-data'

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando planos...</div>}>
      <PlansPageInner />
    </Suspense>
  )
}

function PlansPageInner() {
  const params = useSearchParams()
  const { state, reload } = useBillingLoad()
  const [plans, setPlans] = useState<SaaSPlan[]>([])
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('mensal')
  const [trialMsg, setTrialMsg] = useState('')
  const [trialDays, setTrialDays] = useState(0)
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const upgradeTarget = params.get('upgrade')

  useEffect(() => {
    const list = loadPlans()
      .filter((p) => p.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    setPlans(list)
    const sub = getRealtorSubscription()
    setCurrentPlanId(sub ? getEffectivePlanId(sub) : null)
    setTrialDays(getTrialDaysRemaining(sub))
    setSubStatus(sub?.status || null)
  }, [state])

  const comparisonRows = useMemo(
    () => [
      { label: 'Imóveis ativos', render: (p: SaaSPlan) => limitLabel(p.propertyLimit) },
      { label: 'Usuários', render: (p: SaaSPlan) => limitLabel(p.userLimit) },
      { label: 'Campanhas', render: (p: SaaSPlan) => limitLabel(p.campaignLimit) },
      { label: 'Arquivamento de imóveis', render: (p: SaaSPlan) => (p.archivedProperties ? 'Sim' : 'Não') },
      { label: 'CRM', render: (p: SaaSPlan) => featureLabel('crm', p.features.crm) },
      { label: 'Área do cliente', render: (p: SaaSPlan) => featureLabel('clientArea', p.features.clientArea) },
      { label: 'Meu Site', render: (p: SaaSPlan) => (p.features.brokerSite ? 'Incluído' : 'Não') },
      { label: 'Financeiro', render: (p: SaaSPlan) => (p.features.finance ? 'Incluído' : 'Não') },
      { label: 'Negociações', render: (p: SaaSPlan) => (p.features.negotiations ? 'Incluído' : 'Não') },
      { label: 'Propostas', render: (p: SaaSPlan) => (p.features.proposals ? 'Incluído' : 'Não') },
      { label: 'Documentos', render: (p: SaaSPlan) => (p.features.documents ? 'Incluído' : 'Não') },
      { label: 'Gestão de equipe', render: (p: SaaSPlan) => (p.features.team ? 'Incluído' : 'Não') },
      { label: 'IA + WhatsApp', render: (p: SaaSPlan) => featureLabel('ai', p.features.ai) },
      { label: 'Domínio próprio', render: (p: SaaSPlan) => featureLabel('customDomain', p.features.customDomain) },
      { label: 'Relatórios', render: (p: SaaSPlan) => featureLabel('reports', p.features.reports) },
      { label: 'Integrações', render: (p: SaaSPlan) => (p.features.integrations ? 'Incluído' : 'Não') },
      { label: 'API / Webhooks', render: (p: SaaSPlan) => (p.features.api ? 'Elegível' : 'Não') },
      { label: 'Suporte', render: (p: SaaSPlan) => featureLabel('support', p.features.support) },
    ],
    []
  )

  const handleStartTrial = () => {
    startTrial()
    setTrialMsg(`Teste de ${TRIAL_DAYS} dias iniciado no Profissional.`)
    reload()
  }

  const ctaFor = (plan: SaaSPlan) => {
    if (currentPlanId === plan.id) return { href: '/plans/atual', label: 'Gerenciar' }
    const isUpgrade =
      currentPlanId &&
      ['essencial', 'profissional', 'premium'].indexOf(plan.id) >
        ['essencial', 'profissional', 'premium'].indexOf(currentPlanId as string)
    if (isUpgrade) {
      return {
        href: `/plans/checkout?plano=${plan.id}&ciclo=${billingCycle}`,
        label: 'Fazer upgrade',
      }
    }
    if (currentPlanId && currentPlanId !== plan.id) {
      return { href: `/plans/atual?downgrade=${plan.id}`, label: 'Solicitar downgrade' }
    }
    return {
      href: `/plans/checkout?plano=${plan.id}&ciclo=${billingCycle}`,
      label: 'Contratar',
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Planos' }]} />
      <div className="space-y-8 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Planos e assinaturas</h1>
            <p className="text-sm text-muted-foreground">
              Compare recursos e limites. Valores ainda não são finais.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLAN_PRICES_PROVISIONAL ? <ProvisionalBadge /> : null}
            <Link href="/plans/atual">
              <Button variant="outline">Plano atual</Button>
            </Link>
            <Link href="/plans/faturas">
              <Button variant="outline">Faturas</Button>
            </Link>
          </div>
        </div>

        {trialMsg ? <SuccessAlert message={trialMsg} onClose={() => setTrialMsg('')} /> : null}

        {upgradeTarget ? (
          <Alert
            variant="info"
            title="Upgrade sugerido"
            description={`Para liberar o recurso desejado, escolha o plano ${upgradeTarget} ou superior.`}
          />
        ) : null}

        {subStatus === 'trial' ? (
          <Alert
            variant="success"
            title={`Teste gratuito — ${trialDays} dia(s) restante(s)`}
            description={`Você está no trial do Profissional (${TRIAL_DAYS} dias). Contrate para manter o acesso após o período.`}
          />
        ) : subStatus !== 'ativa' && subStatus !== 'adequacao' ? (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">Experimente o Profissional grátis</p>
              <p className="text-sm text-muted-foreground">
                {TRIAL_DAYS} dias com acesso completo ao plano recomendado — sem cobrança agora.
              </p>
            </div>
            <Button onClick={handleStartTrial}>Iniciar teste de {TRIAL_DAYS} dias</Button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Cobrança:</span>
          <div className="inline-flex rounded-lg border border-border p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${billingCycle === 'mensal' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setBillingCycle('mensal')}
            >
              Mensal
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${billingCycle === 'anual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setBillingCycle('anual')}
            >
              Anual
            </button>
          </div>
          {billingCycle === 'anual' && plans[1] ? (
            <Badge variant="success">
              Economize até {formatCurrency(getYearlySavings(plans.find((p) => p.recommended) || plans[1]))}
            </Badge>
          ) : null}
        </div>

        <BillingState state={state} onRetry={reload}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const cta = ctaFor(plan)
              return (
                <div key={plan.id} className="flex flex-col">
                  <PlanCard
                    plan={plan}
                    current={currentPlanId === plan.id}
                    billingCycle={billingCycle}
                    ctaLabel={cta.label}
                    onSelect={() => {
                      window.location.href = cta.href
                    }}
                  />
                  {billingCycle === 'anual' ? (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      {formatCurrency(getEquivalentMonthly(plan))}/mês · economia{' '}
                      {formatCurrency(getYearlySavings(plan))}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Comparação de recursos</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-3 text-left">Recurso</th>
                    {plans.map((p) => (
                      <th key={p.id} className="p-3 text-left whitespace-nowrap">
                        {p.name}
                        {p.recommended ? (
                          <Badge className="ml-2" variant="primary">
                            Recomendado
                          </Badge>
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-t border-border">
                      <td className="p-3 text-muted-foreground whitespace-nowrap">{row.label}</td>
                      {plans.map((p) => (
                        <td key={`${row.label}-${p.id}`} className="p-3 text-foreground">
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Serviços adicionais</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {addOnProducts.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.provisional ? <Badge variant="info">Provisório</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-3 font-semibold text-primary">
                    {item.price > 0 ? formatCurrency(item.price) : 'Sob consulta'}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">· {item.billing}</span>
                  </p>
                  {item.href ? (
                    <Link href={item.href} className="mt-3 inline-block">
                      <Button size="sm" variant="outline">
                        Ver módulo
                      </Button>
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Perguntas frequentes</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Posso trocar de plano depois?</strong> Sim. Upgrade é imediato
                (simulado); downgrade entra em período de adequação de 7 dias.
              </p>
              <p>
                <strong className="text-foreground">O que acontece após o trial?</strong> Sem contratação, o acesso
                fica limitado ao Essencial.
              </p>
              <p>
                <strong className="text-foreground">Os preços são finais?</strong> Não — todos os valores desta demo
                são provisórios.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Link href="/plans/atual">
              <Button variant="outline">Ver uso dos limites</Button>
            </Link>
          </div>
        </BillingState>
      </div>
    </div>
  )
}
