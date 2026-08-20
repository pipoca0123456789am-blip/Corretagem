'use client'

import { useEffect, useMemo, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { propertiesList } from '@/lib/mock-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import { Plus, Grid, List, Search } from 'lucide-react'
import Link from 'next/link'
import { labelPt, propertyStatusLabels, propertyTypeLabels } from '@/lib/labels-pt'
import {
  getExtraSiteProperties,
  setPropertyArchived,
  isPropertyArchived,
} from '@/lib/meu-site-data'

type Row = {
  id: string | number
  title: string
  address: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  status: string
  type: string
  image: string
  realtorId: number
  fromSite?: boolean
}

function mapStatus(status: string): 'available' | 'sold' | 'rented' | 'pending' {
  if (status === 'sold' || status === 'archived') return 'sold'
  if (status === 'rented') return 'rented'
  if (status === 'published' || status === 'approved' || status === 'available') return 'available'
  return 'pending'
}

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState('recent')
  const [admin, setAdmin] = useState(false)
  const [realtorId, setRealtorId] = useState<number | null>(1)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setAdmin(isSuperAdmin())
    setRealtorId(getCurrentRealtorId())
  }, [])

  const propertyTypes = ['all', 'apartment', 'house', 'commercial', 'land']

  const rows: Row[] = useMemo(() => {
    const base: Row[] = propertiesList.map((prop) => ({
      id: prop.id,
      title: prop.title,
      address: prop.address,
      price: prop.price,
      area: prop.area,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      status: isPropertyArchived(prop.id) ? 'archived' : prop.status,
      type: prop.type,
      image: prop.image,
      realtorId: prop.realtor?.id ?? 1,
    }))
    const extras: Row[] = getExtraSiteProperties(realtorId ?? undefined).map((p) => ({
      id: p.id,
      title: p.title,
      address: p.address,
      price: p.price,
      area: p.area,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      status: isPropertyArchived(p.id) ? 'archived' : p.status === 'available' ? 'published' : p.status,
      type: 'apartment',
      image: p.image,
      realtorId: p.realtorId,
      fromSite: true,
    }))
    return [...extras, ...base]
  }, [realtorId, tick])

  const filtered = useMemo(() => {
    return rows.filter((prop) => {
      const scoped = admin || realtorId === null ? true : prop.realtorId === realtorId
      const matchesSearch =
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.address.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || prop.type === selectedType
      const matchesStatus =
        selectedStatus === 'all' ||
        prop.status === selectedStatus ||
        (selectedStatus === 'published' && prop.status === 'available')
      return scoped && matchesSearch && matchesType && matchesStatus
    })
  }, [rows, searchTerm, selectedType, selectedStatus, admin, realtorId])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    if (sortBy === 'price-asc') copy.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') copy.sort((a, b) => b.price - a.price)
    if (sortBy === 'area-asc') copy.sort((a, b) => a.area - b.area)
    if (sortBy === 'area-desc') copy.sort((a, b) => b.area - a.area)
    return copy
  }, [filtered, sortBy])

  const archive = (id: string | number) => {
    setPropertyArchived(id, true)
    setTick((t) => t + 1)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Imóveis' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Meus imóveis</h1>
            <p className="text-sm text-muted-foreground">
              {sorted.length} imóvel{sorted.length !== 1 ? 'is' : ''} · carteira isolada
            </p>
          </div>
          <Link href="/properties/create">
            <Button className="gap-2">
              <Plus className="h-5 w-5" />
              Novo imóvel
            </Button>
          </Link>
        </div>

        <Alert
          variant="info"
          description="Ao publicar no Meu Site, o imóvel entra automaticamente na vitrine. Arquivar remove do site público."
        />

        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por título ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={selectedType === t ? 'primary' : 'outline'}
                onClick={() => setSelectedType(t)}
              >
                {labelPt(propertyTypeLabels, t)}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {['all', 'published', 'sold', 'rented', 'draft', 'archived'].map((s) => (
                <button key={s} type="button" onClick={() => setSelectedStatus(s)}>
                  <Badge variant={selectedStatus === s ? 'primary' : 'default'}>
                    {s === 'all' ? 'Status' : s === 'archived' ? 'Arquivado' : labelPt(propertyStatusLabels, s)}
                  </Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={viewMode === 'grid' ? 'primary' : 'outline'} onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button size="sm" variant={viewMode === 'list' ? 'primary' : 'outline'} onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar imóveis"
              >
                <option value="recent">Recentes</option>
                <option value="price-asc">Preço ↑</option>
                <option value="price-desc">Preço ↓</option>
                <option value="area-asc">Área ↑</option>
                <option value="area-desc">Área ↓</option>
              </select>
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            title="Nenhum imóvel"
            description="Cadastre o primeiro imóvel da sua carteira."
            action={{
              label: 'Novo imóvel',
              onClick: () => {
                window.location.href = '/properties/create'
              },
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((prop) => (
              <div key={String(prop.id)} className="space-y-2">
                <Link href={prop.fromSite ? '/meu-site' : `/properties/${prop.id}`}>
                  <PropertyCard
                    id={prop.id}
                    image={
                      prop.image.startsWith('/')
                        ? 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'
                        : prop.image
                    }
                    title={prop.title}
                    location={prop.address}
                    price={prop.price}
                    area={prop.area}
                    beds={prop.bedrooms}
                    baths={prop.bathrooms}
                    status={mapStatus(prop.status)}
                  />
                </Link>
                {prop.status !== 'archived' ? (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => archive(prop.id)}>
                    Arquivar (remover do site)
                  </Button>
                ) : (
                  <Badge variant="secondary">Arquivado · fora do site</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((prop) => (
              <div
                key={String(prop.id)}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <Link href={prop.fromSite ? '/meu-site' : `/properties/${prop.id}`} className="min-w-0">
                  <p className="font-semibold text-foreground">{prop.title}</p>
                  <p className="text-sm text-muted-foreground">{prop.address}</p>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {prop.status === 'archived'
                      ? 'Arquivado'
                      : labelPt(propertyStatusLabels, prop.status)}
                  </Badge>
                  {prop.status !== 'archived' ? (
                    <Button size="sm" variant="outline" onClick={() => archive(prop.id)}>
                      Arquivar
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
