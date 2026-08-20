'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { propertiesList } from '@/lib/mock-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import { Edit2, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { labelPt, propertyStatusLabels } from '@/lib/labels-pt'

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = Number(params.id)
  const [property, setProperty] = useState<(typeof propertiesList)[0] | null | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const found = propertiesList.find((p) => p.id === propertyId) || null
    if (!found) {
      setProperty(null)
      return
    }
    const realtorId = getCurrentRealtorId()
    if (!isSuperAdmin() && realtorId !== null && found.realtor?.id !== realtorId) {
      setProperty(null)
      return
    }
    setProperty(found)
  }, [propertyId])

  if (property === undefined) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Imóvel não encontrado"
          description="Ele não existe ou não pertence à sua carteira."
          action={{ label: 'Voltar aos imóveis', onClick: () => { window.location.href = '/properties' } }}
        />
      </div>
    )
  }

  const tabs = ['overview', 'media', 'owner', 'realtor', 'leads', 'visits', 'proposals', 'metrics', 'history']
  const tabLabels: Record<string, string> = {
    overview: 'Visão Geral',
    media: 'Mídias',
    owner: 'Proprietário',
    realtor: 'Responsável',
    leads: 'Leads',
    visits: 'Visitas',
    proposals: 'Propostas',
    metrics: 'Métricas',
    history: 'Histórico',
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Imóveis', href: '/properties' },
          { label: property.title },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{property.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.address}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{labelPt(propertyStatusLabels, property.status)}</Badge>
            <Link href={`/properties/${property.id}/edit`}>
              <Button size="sm" className="gap-2">
                <Edit2 className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Preço</p>
            <p className="text-xl font-bold text-primary">
              {property.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Área</p>
            <p className="text-xl font-bold text-foreground">{property.area} m²</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quartos</p>
            <p className="text-xl font-bold text-foreground">{property.bedrooms}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Banheiros</p>
            <p className="text-xl font-bold text-foreground">{property.bathrooms}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={activeTab === tab ? 'primary' : 'outline'}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{property.description}</p>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <Badge key={f} variant="default">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'media' && (
            <div className="space-y-3">
              <Alert
                variant="info"
                description="Upload real de mídias não está habilitado. Prévia visual simulada."
              />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-xs text-muted-foreground"
                  >
                    Foto {i} (simulada)
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'owner' && (
            <div>
              <p className="font-medium text-foreground">{property.owner.name}</p>
              <p className="text-sm text-muted-foreground">{property.owner.email}</p>
            </div>
          )}
          {activeTab === 'realtor' && (
            <p className="font-medium text-foreground">{property.realtor.name}</p>
          )}
          {activeTab === 'leads' && (
            <p className="text-muted-foreground">Contatos: {property.contacts}</p>
          )}
          {activeTab === 'visits' && (
            <p className="text-muted-foreground">Visitas: {property.visits}</p>
          )}
          {activeTab === 'proposals' && (
            <p className="text-muted-foreground">Propostas vinculadas a este imóvel (simulado).</p>
          )}
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                ['Visualizações', property.views],
                ['Contatos', property.contacts],
                ['Compartilhamentos', property.shares],
                ['Favoritos', property.favorites],
                ['Visitas', property.visits],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'history' && (
            <p className="text-sm text-muted-foreground">
              Atualizado em {property.updatedAt} · Criado em {property.createdAt}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
