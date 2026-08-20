'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Progress } from '@/components/design-system/feedback/progress'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { useClientRealtor } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import {
  canAccessClientPortal,
  completeClientOnboarding,
  saveJson,
  setFinancialConsent,
} from '@/lib/client-auth'
import {
  ClientQualification,
  emptyQualification,
  featureOptions,
  matchProperties,
  objectiveOptions,
  onboardingSteps,
} from '@/lib/phase11-data'

export default function ClientOnboardingPage() {
  const router = useRouter()
  const { slug, profile } = useClientRealtor()
  const [data, setData] = useState<ClientQualification>(emptyQualification())
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!canAccessClientPortal(slug)) router.replace(`/cliente/${slug}/login`)
  }, [slug, router])

  const matches = useMemo(
    () => (profile ? matchProperties(profile.id, data) : []),
    [profile, data]
  )

  if (!profile) {
    return (
      <div className="p-8">
        <EmptyState title="Corretor não encontrado" />
      </div>
    )
  }

  const step = data.step
  const progress = Math.round(((step + 1) / onboardingSteps.length) * 100)
  const wide = step === 5

  const next = () => {
    setError('')
    if (step === 0 && !data.objective) {
      setError('Selecione seu objetivo.')
      return
    }
    if (step === 3 && !consent) {
      setError('É necessário consentir o uso dos dados financeiros nesta etapa.')
      return
    }
    if (step === 3) setFinancialConsent(true)
    const nextStep = Math.min(step + 1, onboardingSteps.length - 1)
    const payload = { ...data, step: nextStep }
    saveJson('qualification', payload)
    setData(payload)
  }

  const back = () => setData((prev) => ({ ...prev, step: Math.max(prev.step - 1, 0) }))

  const finish = () => {
    saveJson('qualification', data)
    completeClientOnboarding()
    setSuccess('Qualificação salva. Abrindo seu dashboard...')
    setTimeout(() => router.push(`/cliente/${slug}`), 800)
  }

  const toggleFeature = (feature: string) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-10">
      <div className={`mx-auto ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <div className="mb-6 flex items-center gap-3">
          <img src={profile.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Onboarding</p>
            <p className="font-semibold text-foreground">Qualificação com {profile.firstName}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 md:p-8">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Qualificação do seu perfil</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Progresso salvo visualmente a cada etapa. Imóveis sugeridos pertencem só a este corretor.
          </p>

          <div className="mt-6">
            <Progress
              value={progress}
              label={`Etapa ${step + 1} de ${onboardingSteps.length}: ${onboardingSteps[step].title}`}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {onboardingSteps.map((item, index) => (
              <Badge
                key={item.id}
                variant={index === step ? 'primary' : index < step ? 'success' : 'default'}
              >
                {item.title}
              </Badge>
            ))}
          </div>

          {error ? <Alert className="mt-4" variant="destructive" description={error} /> : null}
          {success ? <Alert className="mt-4" variant="success" description={success} /> : null}

          <div className="mt-6 space-y-4">
            {step === 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {objectiveOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        objective: opt.value as ClientQualification['objective'],
                      })
                    }
                    className={`rounded-lg border p-4 text-left text-sm font-medium transition-colors ${
                      data.objective === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <>
                <Select
                  label="Tipo de imóvel"
                  value={data.propertyType}
                  onChange={(e) => setData({ ...data, propertyType: e.target.value })}
                  options={[
                    { value: 'apartamento', label: 'Apartamento' },
                    { value: 'casa', label: 'Casa' },
                    { value: 'cobertura', label: 'Cobertura' },
                    { value: 'studio', label: 'Studio' },
                    { value: 'comercial', label: 'Comercial' },
                  ]}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Quartos" type="number" value={data.bedrooms} onChange={(e) => setData({ ...data, bedrooms: e.target.value })} />
                  <Input label="Suítes" type="number" value={data.suites} onChange={(e) => setData({ ...data, suites: e.target.value })} />
                  <Input label="Banheiros" type="number" value={data.bathrooms} onChange={(e) => setData({ ...data, bathrooms: e.target.value })} />
                  <Input label="Vagas" type="number" value={data.parking} onChange={(e) => setData({ ...data, parking: e.target.value })} />
                  <Input label="Área mínima (m²)" type="number" value={data.areaMin} onChange={(e) => setData({ ...data, areaMin: e.target.value })} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Características desejadas</p>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => toggleFeature(feature)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          data.features.includes(feature)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Input label="Cidade" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
                <Input label="Bairro de preferência" value={data.neighborhood} onChange={(e) => setData({ ...data, neighborhood: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Faixa de preço mínima (R$)" type="number" value={data.priceMin} onChange={(e) => setData({ ...data, priceMin: e.target.value })} />
                  <Input label="Faixa de preço máxima (R$)" type="number" value={data.priceMax} onChange={(e) => setData({ ...data, priceMax: e.target.value })} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Alert
                  variant="info"
                  title="Privacidade dos dados financeiros"
                  description="Essas informações são usadas apenas para qualificar seu atendimento com este corretor. Não há cálculo financeiro real nesta fase."
                />
                <Checkbox
                  checked={consent}
                  onCheckedChange={setConsent}
                  label="Autorizo o uso confidencial dos meus dados financeiros para atendimento"
                />
                <Select
                  label="Faixa de renda"
                  value={data.incomeRange}
                  onChange={(e) => setData({ ...data, incomeRange: e.target.value })}
                  options={[
                    { value: 'ate-5', label: 'Até R$ 5.000' },
                    { value: '5-10', label: 'R$ 5.000 a R$ 10.000' },
                    { value: '10-20', label: 'R$ 10.000 a R$ 20.000' },
                    { value: '20+', label: 'Acima de R$ 20.000' },
                  ]}
                />
                <Input label="Renda familiar (R$)" type="number" value={data.familyIncome} onChange={(e) => setData({ ...data, familyIncome: e.target.value })} />
                <Input label="Entrada disponível (R$)" type="number" value={data.downPayment} onChange={(e) => setData({ ...data, downPayment: e.target.value })} />
                <Input label="Valor máximo da parcela (R$)" type="number" value={data.maxInstallment} onChange={(e) => setData({ ...data, maxInstallment: e.target.value })} />
                <Checkbox checked={data.useFgts} onCheckedChange={(v) => setData({ ...data, useFgts: v })} label="Pretendo usar FGTS" />
                <Checkbox checked={data.needsFinancing} onCheckedChange={(v) => setData({ ...data, needsFinancing: v })} label="Preciso de financiamento" />
                <Checkbox checked={data.creditApproved} onCheckedChange={(v) => setData({ ...data, creditApproved: v })} label="Já tenho crédito aprovado" />
              </>
            )}

            {step === 4 && (
              <>
                <Select
                  label="Prazo para compra / decisão"
                  value={data.purchaseDeadline}
                  onChange={(e) => setData({ ...data, purchaseDeadline: e.target.value })}
                  options={[
                    { value: 'imediato', label: 'Imediato' },
                    { value: '3-meses', label: 'Até 3 meses' },
                    { value: '6-meses', label: 'Até 6 meses' },
                    { value: '12-meses', label: 'Até 12 meses' },
                  ]}
                />
                <Select
                  label="Melhor horário para contato"
                  value={data.contactTime}
                  onChange={(e) => setData({ ...data, contactTime: e.target.value })}
                  options={[
                    { value: 'manha', label: 'Manhã' },
                    { value: 'comercial', label: 'Horário comercial' },
                    { value: 'noite', label: 'Noite' },
                    { value: 'fim-de-semana', label: 'Fim de semana' },
                  ]}
                />
              </>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <Alert
                  variant="success"
                  title="Imóveis compatíveis"
                  description={`Seleção exclusiva da carteira de ${profile.firstName}.`}
                />
                {matches.length === 0 ? (
                  <EmptyState
                    title="Sem compatíveis no momento"
                    description="Ajuste preferências depois no painel."
                  />
                ) : (
                  <ClientPropertyGrid properties={matches.slice(0, 3)} profile={profile} showDiscard />
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              Voltar
            </Button>
            {step < onboardingSteps.length - 1 ? (
              <Button onClick={next}>Salvar e continuar</Button>
            ) : (
              <Button onClick={finish}>Ir para o painel</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
