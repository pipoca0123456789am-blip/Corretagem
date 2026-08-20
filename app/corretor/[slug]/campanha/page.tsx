'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { QualificationForm, ScheduleForm, WhatsAppButton } from '@/components/public-realtor/site-chrome'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { getPublicRealtorBySlug, getRealtorProperties, toCardStatus } from '@/lib/phase9-data'
import { PropertyCard } from '@/components/design-system/cards/property-card'

export default function PublicRealtorCampaignPage() {
  const params = useParams()
  const profile = getPublicRealtorBySlug(String(params.slug))
  if (!profile) return null

  const campaign = profile.campaign || {
    title: `Oportunidades com ${profile.firstName}`,
    subtitle: 'Seleção especial de imóveis e atendimento prioritário.',
    highlight: 'Conversão exclusiva deste corretor',
    cta: 'Quero ser priorizado',
  }

  const highlights = getRealtorProperties(profile.id).filter((p) => p.featured).slice(0, 3)

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img src={profile.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/65 to-background" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 md:px-6 md:pb-20 md:pt-28">
          <Badge variant="warning">Campanha</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-white md:text-5xl">
            {campaign.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">{campaign.subtitle}</p>
          <p className="mt-3 text-sm font-medium text-white/70">{campaign.highlight}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton profile={profile} size="lg" label={campaign.cta} />
            <Link href={`/corretor/${profile.slug}/imoveis`}>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/40 bg-white/10 text-white hover:bg-white hover:text-foreground sm:w-auto"
              >
                Ver imóveis da campanha
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Alert
          variant="info"
          title="Sem tráfego pago real"
          description="Esta landing é conceitual para conversão orgânica/simulada. Nenhum anúncio pago está ativo."
        />

        <h2 className="mt-10 text-2xl font-bold text-foreground">Imóveis em evidência</h2>
        {highlights.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            {profile.firstName} ainda não possui imóveis destacados para esta campanha.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((property) => (
              <Link
                key={property.id}
                href={`/corretor/${profile.slug}/imovel/${property.slug}`}
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
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <QualificationForm profile={profile} />
          <ScheduleForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
