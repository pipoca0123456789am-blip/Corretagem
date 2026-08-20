'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Button } from '@/components/design-system/buttons/button'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { WhatsAppButton } from '@/components/public-realtor/site-chrome'
import {
  formatListingPrice,
  getPublicRealtorBySlug,
  getRealtorProperties,
  purposeLabel,
  toCardStatus,
  PublicRealtorProfile,
} from '@/lib/phase9-data'
import { getMergedPublicProfile } from '@/lib/meu-site-data'

const PAGE_SIZE = 6

export default function PublicRealtorPropertiesPage() {
  const params = useParams()
  const slug = String(params.slug)
  const [profile, setProfile] = useState<PublicRealtorProfile | null>(null)
  const [search, setSearch] = useState('')
  const [purpose, setPurpose] = useState('all')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [bedrooms, setBedrooms] = useState('all')
  const [priceMax, setPriceMax] = useState('')
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setProfile(getMergedPublicProfile(slug) || getPublicRealtorBySlug(slug) || null)
  }, [slug])

  const properties = useMemo(
    () => (profile ? getRealtorProperties(profile.id) : []),
    [profile]
  )

  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        const q = search.toLowerCase()
        const matchesSearch =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
        const matchesPurpose = purpose === 'all' || p.purpose === purpose
        const matchesCity = !city || p.city.toLowerCase().includes(city.toLowerCase())
        const matchesNeighborhood =
          !neighborhood || p.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())
        const matchesBeds = bedrooms === 'all' || p.bedrooms >= Number(bedrooms)
        const matchesPrice = !priceMax || p.price <= Number(priceMax)
        return (
          matchesSearch &&
          matchesPurpose &&
          matchesCity &&
          matchesNeighborhood &&
          matchesBeds &&
          matchesPrice
        )
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price
        if (sort === 'price-desc') return b.price - a.price
        if (sort === 'area') return b.area - a.area
        return Number(b.featured) - Number(a.featured)
      })
  }, [properties, search, purpose, city, neighborhood, bedrooms, priceMax, sort])

  useEffect(() => {
    setPage(1)
  }, [search, purpose, city, neighborhood, bedrooms, priceMax, sort])

  if (!profile) return null

  const featured = properties.filter((p) => p.featured).slice(0, 3)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Imóveis de {profile.firstName}</h1>
          <p className="mt-2 text-muted-foreground">
            Catálogo exclusivo · {properties.length} anúncio(s) deste corretor
          </p>
        </div>
        <WhatsAppButton profile={profile} label="Quero uma indicação" />
      </div>

      {featured.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Imóveis em destaque</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <Link
                key={property.id}
                href={`/corretor/${profile.slug}/imovel/${property.slug}`}
                className="space-y-2"
              >
                <PropertyCard
                  image={property.image}
                  title={property.title}
                  location={property.address}
                  price={property.price}
                  status={toCardStatus(property.status)}
                  bedrooms={property.bedrooms || undefined}
                  bathrooms={property.bathrooms || undefined}
                  area={property.area}
                  agent={{ name: profile.name }}
                />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">Todos os imóveis</h2>
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar bairro, cidade ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Finalidade"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              options={[
                { value: 'all', label: 'Comprar ou alugar' },
                { value: 'venda', label: 'Comprar' },
                { value: 'aluguel', label: 'Alugar' },
                { value: 'lancamento', label: 'Lançamento' },
              ]}
            />
            <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input
              label="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
            <Select
              label="Quartos"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: '1', label: '1+' },
                { value: '2', label: '2+' },
                { value: '3', label: '3+' },
                { value: '4', label: '4+' },
              ]}
            />
            <Input
              label="Preço máximo"
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
            <Select
              label="Ordenar"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { value: 'featured', label: 'Destaques primeiro' },
                { value: 'price-asc', label: 'Menor preço' },
                { value: 'price-desc', label: 'Maior preço' },
                { value: 'area', label: 'Maior área' },
              ]}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="Nenhum imóvel encontrado"
              description={
                properties.length === 0
                  ? `${profile.name} ainda não publicou imóveis nesta página.`
                  : 'Ajuste os filtros para ver outras opções deste corretor.'
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((property) => (
                <Link
                  key={property.id}
                  href={`/corretor/${profile.slug}/imovel/${property.slug}`}
                  className="space-y-2"
                >
                  <PropertyCard
                    image={property.image}
                    title={property.title}
                    location={property.address}
                    price={property.price}
                    status={toCardStatus(property.status)}
                    bedrooms={property.bedrooms || undefined}
                    bathrooms={property.bathrooms || undefined}
                    area={property.area}
                    agent={{ name: profile.name }}
                  />
                  <div className="flex items-center justify-between px-1">
                    <Badge variant="info">{purposeLabel(property.purpose)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatListingPrice(property)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
