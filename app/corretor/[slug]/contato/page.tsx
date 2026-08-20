'use client'

import { useParams } from 'next/navigation'
import { Mail, MapPin, Phone } from 'lucide-react'
import { ContactForm, QualificationForm, WhatsAppButton } from '@/components/public-realtor/site-chrome'
import { Alert } from '@/components/design-system/feedback/alert'
import { getPublicRealtorBySlug } from '@/lib/phase9-data'

export default function PublicRealtorContactPage() {
  const params = useParams()
  const profile = getPublicRealtorBySlug(String(params.slug))
  if (!profile) return null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">Contato com {profile.firstName}</h1>
        <p className="mt-2 text-muted-foreground">
          Todo lead enviado nesta página permanece vinculado exclusivamente a {profile.name}.
        </p>
      </div>

      <Alert
        className="mt-6"
        variant="info"
        title="Atendimento exclusivo"
        description="Não há compartilhamento automático com outros corretores."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span>{profile.regions.join(' · ')}</span>
            </div>
            <WhatsAppButton profile={profile} className="w-full" />
          </div>
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            Mapa ilustrativo — integração real de mapas não está habilitada nesta fase.
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Envie uma mensagem</h2>
            <ContactForm profile={profile} />
          </div>
          <QualificationForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
