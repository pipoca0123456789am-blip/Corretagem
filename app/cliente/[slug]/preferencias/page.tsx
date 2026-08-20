'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Progress } from '@/components/design-system/feedback/progress'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { loadJson, saveJson } from '@/lib/client-auth'
import {
  ClientQualification,
  emptyQualification,
  featureOptions,
  objectiveOptions,
} from '@/lib/phase11-data'

export default function ClientPreferencesPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [data, setData] = useState<ClientQualification>(emptyQualification())
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setData(loadJson('qualification', emptyQualification()))
  }, [])

  if (!profile) return null

  const toggleFeature = (feature: string) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Preferências de imóvel</h1>
        <p className="text-sm text-muted-foreground">
          Atualização das preferências usadas nas recomendações de {profile.firstName}
        </p>
      </div>
      {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}
      <Progress value={100} label="Preferências ativas" showPercentage={false} />
      <PageState state={state} onRetry={reload}>
        <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
          <Select
            label="Objetivo"
            value={data.objective || 'comprar'}
            onChange={(e) =>
              setData({ ...data, objective: e.target.value as ClientQualification['objective'] })
            }
            options={objectiveOptions}
          />
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
            <Input label="Cidade" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
            <Input label="Bairro" value={data.neighborhood} onChange={(e) => setData({ ...data, neighborhood: e.target.value })} />
            <Input label="Quartos" type="number" value={data.bedrooms} onChange={(e) => setData({ ...data, bedrooms: e.target.value })} />
            <Input label="Suítes" type="number" value={data.suites} onChange={(e) => setData({ ...data, suites: e.target.value })} />
            <Input label="Banheiros" type="number" value={data.bathrooms} onChange={(e) => setData({ ...data, bathrooms: e.target.value })} />
            <Input label="Vagas" type="number" value={data.parking} onChange={(e) => setData({ ...data, parking: e.target.value })} />
            <Input label="Área mínima" type="number" value={data.areaMin} onChange={(e) => setData({ ...data, areaMin: e.target.value })} />
            <Input label="Preço máx. (R$)" type="number" value={data.priceMax} onChange={(e) => setData({ ...data, priceMax: e.target.value })} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Características desejadas</p>
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
          <Button
            onClick={() => {
              saveJson('qualification', data)
              setSuccess('Preferências atualizadas. As recomendações serão recalculadas.')
            }}
          >
            Atualizar preferências
          </Button>
        </div>
      </PageState>
    </div>
  )
}
