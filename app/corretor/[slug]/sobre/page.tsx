'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/design-system/feedback/badge'
import { Button } from '@/components/design-system/buttons/button'
import { WhatsAppButton } from '@/components/public-realtor/site-chrome'
import { getPublicRealtorBySlug } from '@/lib/phase9-data'

export default function PublicRealtorAboutPage() {
  const params = useParams()
  const profile = getPublicRealtorBySlug(String(params.slug))
  if (!profile) return null

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <img src={profile.coverImage} alt="" className="h-56 w-full object-cover md:h-72" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-6xl items-end gap-4 px-4 pb-6 md:px-6">
          <img
            src={profile.photo}
            alt={profile.name}
            className="h-24 w-24 rounded-2xl object-cover ring-2 ring-white md:h-32 md:w-32"
          />
          <div className="pb-1 text-white">
            <h1 className="text-2xl font-bold md:text-4xl">{profile.name}</h1>
            <p className="text-sm text-white/80">{profile.creci}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_0.8fr] md:px-6 md:py-14">
        <div className="space-y-8">
          <div>
            <Badge variant="primary">Biografia</Badge>
            <h2 className="mt-3 text-2xl font-bold text-foreground">{profile.title}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{profile.bio}</p>
            <p className="mt-4 text-muted-foreground">{profile.promise}</p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Especialidades</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.specialties.map((item) => (
                <Badge key={item} variant="default">{item}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Regiões de atuação</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.regions.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
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

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {profile.rating} · {profile.reviewsCount} avaliações
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{profile.dealsClosed} negócios · {profile.yearsExperience} anos</p>
            <div className="mt-5 space-y-2">
              <WhatsAppButton profile={profile} className="w-full" />
              <Link href={`/corretor/${profile.slug}/imoveis`}>
                <Button variant="outline" className="w-full">Ver imóveis</Button>
              </Link>
              <Link href={`/corretor/${profile.slug}/contato`}>
                <Button variant="secondary" className="w-full">Contato</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-sm">
            <p className="font-semibold text-foreground">Redes sociais</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {profile.social.instagram && <li>Instagram: {profile.social.instagram}</li>}
              {profile.social.linkedin && <li>LinkedIn: {profile.social.linkedin}</li>}
              {profile.social.facebook && <li>Facebook: {profile.social.facebook}</li>}
              {profile.social.youtube && <li>YouTube: {profile.social.youtube}</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
