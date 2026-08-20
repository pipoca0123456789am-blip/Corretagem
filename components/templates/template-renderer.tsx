'use client'

import Link from 'next/link'
import { ArrowRight, BadgeCheck, MapPin, MessageCircle } from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { Badge } from '@/components/design-system/feedback/badge'
import { toCardStatus, PublicRealtorProfile, PublicProperty } from '@/lib/phase9-data'
import { PageTemplate, BrokerTemplateCustomization } from '@/lib/template-marketplace-data'
import { WhatsAppButton, QualificationForm } from '@/components/public-realtor/site-chrome'

export interface TemplateRenderProps {
  template: PageTemplate
  profile: PublicRealtorProfile
  properties: PublicProperty[]
  customization?: BrokerTemplateCustomization | null
  demo?: boolean
}

function resolveCopy(
  custom: BrokerTemplateCustomization | null | undefined,
  key: string,
  fallback: string
) {
  const draft = (custom?.published && Object.keys(custom.published).length
    ? custom.published
    : custom?.draft) as Record<string, unknown> | undefined
  const value = draft?.[key]
  return typeof value === 'string' && value.trim() ? value : fallback
}

/** Renderer modular — layouts originais por família visual, dados do corretor. */
export function TemplateRenderer({
  template,
  profile,
  properties,
  customization,
  demo = false,
}: TemplateRenderProps) {
  const t = template.themeTokens
  const base = `/corretor/${profile.slug}`
  const heroTitle = resolveCopy(customization, 'heroTitle', profile.promise || profile.name)
  const heroSubtitle = resolveCopy(
    customization,
    'heroSubtitle',
    `${profile.creci} · ${profile.regions?.[0] || 'Brasil'}`
  )
  const photo = resolveCopy(customization, 'photo', profile.photo)
  const cover = resolveCopy(customization, 'cover', profile.coverImage)
  const featured = properties.filter((p) => p.featured).slice(0, 6)
  const list = (featured.length ? featured : properties).slice(0, 6)
  const isDark = template.slug.includes('luxury') || template.slug.includes('prestige')

  return (
    <div
      className="min-h-screen"
      style={
        {
          ['--tpl-primary' as string]: t.primary,
          ['--tpl-accent' as string]: t.accent,
          ['--tpl-bg' as string]: t.background,
          ['--tpl-fg' as string]: t.foreground,
          background: t.background,
          color: t.foreground,
          fontFamily: t.fontBody,
        } as React.CSSProperties
      }
    >
      {demo ? (
        <div className="sticky top-0 z-50 bg-amber-500 px-3 py-2 text-center text-xs font-semibold text-amber-950">
          DEMONSTRAÇÃO COM DADOS FICTÍCIOS — não altera seu site público
        </div>
      ) : null}

      {/* Header */}
      <header
        className="border-b px-4 py-4 md:px-8"
        style={{ borderColor: `${t.foreground}22`, background: isDark ? t.primary : '#fff' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={photo} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <p
                className="font-semibold leading-tight"
                style={{ fontFamily: t.fontDisplay, color: isDark ? t.foreground : t.primary }}
              >
                {profile.name}
              </p>
              <p className="text-xs opacity-70">{profile.creci}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href={`${base}/imoveis`}>
              <Button size="sm" variant="outline">
                Imóveis
              </Button>
            </Link>
            <WhatsAppButton profile={profile} size="sm" label="WhatsApp" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(120deg, ${t.primary}ee 0%, ${t.primary}99 45%, transparent 80%)`,
          }}
        />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end gap-6 px-4 py-16 text-white md:px-8">
          <Badge className="w-fit bg-white/15 text-white hover:bg-white/20">{template.style}</Badge>
          <h1
            className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl"
            style={{ fontFamily: t.fontDisplay }}
          >
            {heroTitle}
          </h1>
          <p className="max-w-xl text-base text-white/90 md:text-lg">{heroSubtitle}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`${base}/imoveis`}>
              <Button size="lg" className="w-full sm:w-auto" style={{ background: t.accent, color: '#111' }}>
                Ver imóveis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href={`${base}/encontrar`}>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-white/10 text-white hover:bg-white hover:text-foreground sm:w-auto"
              >
                Qualificar meu perfil
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: t.accent }}>
              Carteira do corretor
            </p>
            <h2 className="text-2xl font-bold md:text-3xl" style={{ fontFamily: t.fontDisplay }}>
              Imóveis em destaque
            </h2>
            <p className="mt-1 text-sm opacity-70">Atualizados automaticamente a partir do painel.</p>
          </div>
          <Link href={`${base}/imoveis`} className="text-sm font-medium underline-offset-4 hover:underline">
            Ver todos
          </Link>
        </div>
        {list.length === 0 ? (
          <p className="text-sm opacity-70">Nenhum imóvel publicado no momento.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link key={p.id} href={`${base}/imovel/${p.slug}`} className="block">
                <PropertyCard
                  image={p.image}
                  title={p.title}
                  price={p.price}
                  location={`${p.neighborhood}, ${p.city}`}
                  bedrooms={p.bedrooms}
                  bathrooms={p.bathrooms}
                  area={p.area}
                  status={toCardStatus(p.status)}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      {template.sections.includes('about') ? (
        <section
          className="border-y px-4 py-14 md:px-8"
          style={{ borderColor: `${t.foreground}15`, background: isDark ? `${t.primary}` : `${t.primary}08` }}
        >
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[200px_1fr] md:items-center">
            <img src={photo} alt={profile.name} className="mx-auto h-40 w-40 rounded-2xl object-cover shadow-lg" />
            <div>
              <div className="mb-2 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5" style={{ color: t.accent }} />
                <span className="text-sm font-medium">Corretor verificado na plataforma</span>
              </div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: t.fontDisplay }}>
                {profile.name}
              </h2>
              <p className="mt-1 text-sm opacity-70">{profile.creci}</p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed opacity-90 md:text-base">
                {resolveCopy(customization, 'bio', profile.bio || profile.promise)}
              </p>
              {profile.regions?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.regions.slice(0, 6).map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs"
                      style={{ background: `${t.accent}33` }}
                    >
                      <MapPin className="h-3 w-3" />
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Lead form */}
      {template.sections.includes('lead_form') ? (
        <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: t.fontDisplay }}>
                Fale comigo
              </h2>
              <p className="mt-2 text-sm opacity-70">
                Seu contato entra direto no CRM deste corretor — nunca de outro.
              </p>
              <a
                href={`https://wa.me/${(profile.whatsapp || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white"
                style={{ background: '#16a34a' }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
            <div className="rounded-2xl border p-4 md:p-6" style={{ borderColor: `${t.foreground}18` }}>
              {demo ? (
                <p className="text-sm opacity-70">Formulário de exemplo — desativado na demonstração.</p>
              ) : (
                <QualificationForm profile={profile} compact />
              )}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="border-t px-4 py-8 text-center text-xs opacity-60 md:px-8" style={{ borderColor: `${t.foreground}15` }}>
        {profile.name} · {profile.creci} · Template {template.name} v{template.version}
        {demo ? ' · DEMO' : ''}
      </footer>
    </div>
  )
}

/** Dados fictícios para preview de template. */
export const DEMO_PROFILE: PublicRealtorProfile = {
  id: 9001,
  slug: 'demo-template',
  name: 'Ana Exemplo Corretora',
  firstName: 'Ana',
  creci: 'CRECI-SP 00000-F',
  title: 'Corretora demonstração (fictícia)',
  promise: 'Encontre o imóvel certo com atendimento exclusivo (dados de exemplo).',
  bio: 'Perfil fictício usado apenas para demonstração de templates. Não representa um corretor real.',
  photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop',
  phone: '(11) 99999-9999',
  whatsapp: '5511999999999',
  email: 'demo@exemplo.com',
  specialties: ['Residencial', 'Lançamentos'],
  regions: ['Moema', 'Pinheiros', 'Vila Olímpia'],
  differentials: ['Atendimento personalizado', 'Dados de exemplo'],
  videoTitle: 'Vídeo de exemplo',
  videoThumb: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=700&fit=crop',
  rating: 5,
  reviewsCount: 12,
  dealsClosed: 40,
  yearsExperience: 8,
  social: { instagram: '@demo.imoveis' },
  accentLabel: 'Demonstração',
  testimonials: [],
}

export const DEMO_PROPERTIES: PublicProperty[] = [
  {
    id: 'demo-1',
    slug: 'apto-exemplo-moema',
    realtorId: 9001,
    title: 'Apartamento Exemplo — Moema',
    address: 'Rua Exemplo, 100 — Moema',
    neighborhood: 'Moema',
    city: 'São Paulo',
    price: 890000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 98,
    garage: 1,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    description: 'Imóvel fictício para demonstração de template.',
  },
  {
    id: 'demo-2',
    slug: 'casa-exemplo-condominio',
    realtorId: 9001,
    title: 'Casa Exemplo em Condomínio',
    address: 'Alameda Demo, 50 — Morumbi',
    neighborhood: 'Morumbi',
    city: 'São Paulo',
    price: 1450000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    garage: 2,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    description: 'Imóvel fictício para demonstração de template.',
  },
  {
    id: 'demo-3',
    slug: 'studio-exemplo-centro',
    realtorId: 9001,
    title: 'Studio Exemplo — Centro',
    address: 'Av. Exemplo, 200 — Centro',
    neighborhood: 'Centro',
    city: 'São Paulo',
    price: 3200,
    purpose: 'aluguel',
    featured: true,
    status: 'available',
    bedrooms: 1,
    bathrooms: 1,
    area: 42,
    garage: 0,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    description: 'Imóvel fictício para demonstração de template.',
  },
]
