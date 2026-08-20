'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Play,
  Search,
  Star,
} from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { Modal } from '@/components/design-system/feedback/modal'
import {
  QualificationForm,
  ScheduleForm,
  WhatsAppButton,
} from '@/components/public-realtor/site-chrome'
import {
  formatListingPrice,
  getPublicRealtorBySlug,
  getRealtorProperties,
  purposeLabel,
  toCardStatus,
  PublicRealtorProfile,
} from '@/lib/phase9-data'
import { getMergedPublicProfile } from '@/lib/meu-site-data'
import {
  getActiveBrokerTemplate,
  getCustomization,
  PageTemplate,
  trackTemplateEvent,
} from '@/lib/template-marketplace-data'
import { TemplateRenderer } from '@/components/templates/template-renderer'

export default function PublicRealtorHomePage() {
  const params = useParams()
  const slug = String(params.slug)
  const [profile, setProfile] = useState<PublicRealtorProfile | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<PageTemplate | null>(null)
  const [search, setSearch] = useState('')
  const [purpose, setPurpose] = useState('all')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [bedrooms, setBedrooms] = useState('all')
  const [priceMax, setPriceMax] = useState('')
  const [videoOpen, setVideoOpen] = useState(false)

  useEffect(() => {
    const merged = getMergedPublicProfile(slug) || getPublicRealtorBySlug(slug) || null
    setProfile(merged)
    if (merged) {
      const active = getActiveBrokerTemplate(merged.id)
      setActiveTemplate(active?.template || null)
      if (active) {
        trackTemplateEvent('public_page_view', {
          templateId: active.template.id,
          realtorId: merged.id,
        })
      }
    }
  }, [slug])

  const properties = useMemo(
    () => (profile ? getRealtorProperties(profile.id) : []),
    [profile]
  )

  if (!profile) return null

  if (activeTemplate) {
    return (
      <TemplateRenderer
        template={activeTemplate}
        profile={profile}
        properties={properties}
        customization={getCustomization(profile.id)}
      />
    )
  }

  const base = `/corretor/${profile.slug}`
  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.neighborhood.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
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

  const featured = properties.filter((p) => p.featured).slice(0, 3)
  const sales = properties.filter((p) => p.purpose === 'venda').slice(0, 3)
  const rents = properties.filter((p) => p.purpose === 'aluguel').slice(0, 3)
  const launches = properties.filter((p) => p.purpose === 'lancamento').slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <img
          src={profile.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/65 to-black/35" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end gap-8 px-4 pb-12 pt-24 md:flex-row md:items-end md:justify-between md:px-6 md:pb-16">
          <div className="max-w-xl text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {profile.accentLabel}
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-2 text-sm text-white/80 md:text-base">{profile.creci}</p>
            <p className="mt-5 text-base text-white/90 md:text-lg">{profile.promise}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`${base}/encontrar`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Encontrar meu imóvel
                </Button>
              </Link>
              <Link href={`${base}/imoveis`}>
                <Button variant="outline" size="lg" className="w-full border-white/40 bg-white/10 text-white hover:bg-white hover:text-foreground sm:w-auto">
                  Ver imóveis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <WhatsAppButton profile={profile} size="lg" label="Falar no WhatsApp" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.specialties.slice(0, 4).map((s) => (
                <Badge key={s} variant="default" className="bg-white/15 text-white border-white/20">
                  {s}
                </Badge>
              ))}
              {profile.regions[0] ? (
                <Badge variant="default" className="bg-white/15 text-white border-white/20">
                  <MapPin className="mr-1 h-3 w-3" />
                  {profile.regions[0]}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="w-full max-w-xs self-center md:self-end">
            <img
              src={profile.photo}
              alt={profile.name}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/20"
            />
          </div>
        </div>
      </section>

      {/* Quick stats / conversion strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4 md:px-6">
          {[
            { label: 'Avaliação', value: `${profile.rating}/5` },
            { label: 'Depoimentos', value: String(profile.reviewsCount) },
            { label: 'Negócios', value: String(profile.dealsClosed) },
            { label: 'Experiência', value: `${profile.yearsExperience} anos` },
          ].map((item) => (
            <div key={item.label} className="text-center md:text-left">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground md:text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About teaser */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Badge variant="primary">Sobre {profile.firstName}</Badge>
            <h2 className="mt-3 text-3xl font-bold text-foreground">{profile.title}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{profile.bio}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.specialties.map((item) => (
                <Badge key={item} variant="default">{item}</Badge>
              ))}
            </div>
            <Link href={`${base}/sobre`} className="mt-6 inline-block">
              <Button variant="outline">Conhecer trajetória</Button>
            </Link>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground">Regiões de atuação</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.regions.map((region) => (
                  <span
                    key={region}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {region}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Diferenciais</h3>
              <ul className="mt-3 space-y-2">
                {profile.differentials.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="bg-muted/40 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Vídeo de apresentação</h2>
            <p className="mt-2 text-muted-foreground">{profile.videoTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="group relative block w-full overflow-hidden rounded-2xl"
          >
            <img
              src={profile.videoThumb}
              alt="Vídeo de apresentação"
              className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
                <Play className="h-6 w-6 fill-current" />
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Search + filters conversion */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            Buscar imóveis de {profile.firstName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Resultados exclusivos deste corretor — sem misturar carteiras
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              options={[
                { value: 'all', label: 'Comprar ou alugar' },
                { value: 'venda', label: 'Comprar' },
                { value: 'aluguel', label: 'Alugar' },
                { value: 'lancamento', label: 'Lançamentos' },
              ]}
            />
            <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input
              placeholder="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
            />
            <Select
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              options={[
                { value: 'all', label: 'Quartos' },
                { value: '1', label: '1+' },
                { value: '2', label: '2+' },
                { value: '3', label: '3+' },
                { value: '4', label: '4+' },
              ]}
            />
            <Input
              placeholder="Preço máximo"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              type="number"
            />
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Tipo, título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link href={`${base}/encontrar`}>
              <Button className="w-full">Qualificar busca</Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{filtered.length} imóvel(is) encontrado(s)</p>
            <Link href={`${base}/imoveis`}>
              <Button variant="outline" size="sm">Abrir catálogo completo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-y border-border bg-muted/30 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">Como funciona</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Atendimento exclusivo com {profile.firstName} — do primeiro contato à negociação.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '1', t: 'Encontramos seu perfil', d: 'Você conta o que precisa e criamos seu cadastro.' },
              { n: '2', t: 'Indicamos imóveis', d: 'Receba opções só da carteira deste corretor.' },
              { n: '3', t: 'Agendamos visitas', d: 'Marque visitas direto pelo site ou WhatsApp.' },
              { n: '4', t: 'Você negocia com o corretor', d: 'Propostas e acompanhamento com quem conhece o imóvel.' },
            ].map((step) => (
              <div key={step.n} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-bold text-primary">Passo {step.n}</p>
                <h3 className="mt-2 font-semibold text-foreground">{step.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href={`${base}/encontrar`}>
              <Button size="lg">Começar agora</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Property sections */}
      <PropertySection
        title="Imóveis em destaque"
        emptyTitle="Sem destaques no momento"
        items={featured}
        profileName={profile.name}
        profileSlug={profile.slug}
      />
      <PropertySection
        title="Imóveis para venda"
        emptyTitle="Nenhum imóvel à venda"
        items={sales}
        profileName={profile.name}
        profileSlug={profile.slug}
        tone="muted"
      />
      <PropertySection
        title="Imóveis para aluguel"
        emptyTitle="Nenhum imóvel para alugar"
        items={rents}
        profileName={profile.name}
        profileSlug={profile.slug}
      />
      <PropertySection
        title="Lançamentos"
        emptyTitle="Nenhum lançamento disponível"
        items={launches}
        profileName={profile.name}
        profileSlug={profile.slug}
        tone="muted"
      />

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Depoimentos e avaliações</h2>
            <p className="mt-2 flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {profile.rating} · {profile.reviewsCount} avaliações
            </p>
          </div>
          <WhatsAppButton profile={profile} label="Quero esse atendimento" />
        </div>
        {profile.testimonials.length === 0 ? (
          <EmptyState
            title="Ainda sem depoimentos públicos"
            description="Em breve clientes de Diego poderão deixar avaliações nesta página."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {profile.testimonials.map((item) => (
              <blockquote key={item.id} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">“{item.text}”</p>
                <footer className="mt-4">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      {/* Forms / conversion */}
      <section className="bg-muted/40 py-12 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <QualificationForm profile={profile} />
          <ScheduleForm profile={profile} />
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-3 px-4 sm:flex-row md:px-6">
          <Link href={`${base}/avaliacao`} className="flex-1">
            <Button variant="outline" className="w-full">Avaliar meu imóvel</Button>
          </Link>
          <Link href={`${base}/contato`} className="flex-1">
            <Button variant="secondary" className="w-full">Falar com {profile.firstName}</Button>
          </Link>
          <Link href={`${base}/campanha`} className="flex-1">
            <Button variant="primary" className="w-full">Ver campanha atual</Button>
          </Link>
        </div>
      </section>

      <Modal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="Vídeo de apresentação"
        description="Reprodução simulada — sem player externo real"
        footer={<Button onClick={() => setVideoOpen(false)}>Fechar</Button>}
      >
        <p className="text-sm text-muted-foreground">
          Em produção, este espaço exibiria o vídeo institucional de {profile.firstName}.
        </p>
      </Modal>
    </div>
  )
}

function PropertySection({
  title,
  emptyTitle,
  items,
  profileName,
  profileSlug,
  tone,
}: {
  title: string
  emptyTitle: string
  items: ReturnType<typeof getRealtorProperties>
  profileName: string
  profileSlug: string
  tone?: 'muted'
}) {
  return (
    <section className={`${tone === 'muted' ? 'bg-muted/30' : ''} py-12 md:py-14`}>
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">{title}</h2>
        {items.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={`${profileName} ainda não possui imóveis nesta categoria.`}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((property) => (
              <Link
                key={property.id}
                href={`/corretor/${profileSlug}/imovel/${property.slug}`}
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
                  agent={{ name: profileName }}
                />
                <div className="flex items-center justify-between px-1">
                  <Badge variant="info">{purposeLabel(property.purpose)}</Badge>
                  <span className="text-xs text-muted-foreground">{formatListingPrice(property)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
