'use client'

import { useParams } from 'next/navigation'
import { EvaluationForm, WhatsAppButton } from '@/components/public-realtor/site-chrome'
import { Alert } from '@/components/design-system/feedback/alert'
import { getPublicRealtorBySlug } from '@/lib/phase9-data'

export default function PublicRealtorEvaluationPage() {
  const params = useParams()
  const profile = getPublicRealtorBySlug(String(params.slug))
  if (!profile) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-3xl font-bold text-foreground">Avaliação de imóvel</h1>
      <p className="mt-2 text-muted-foreground">
        Solicite uma estimativa com {profile.firstName}. O pedido fica vinculado a este corretor.
      </p>

      <Alert
        className="mt-6"
        variant="info"
        title="Avaliação consultiva"
        description="Resultado ilustrativo — sem laudo oficial automatizado nesta fase."
      />

      <div className="mt-8 rounded-xl border border-border bg-card p-4 md:p-6">
        <EvaluationForm profile={profile} />
      </div>

      <div className="mt-6">
        <WhatsAppButton profile={profile} className="w-full sm:w-auto" label="Tirar dúvidas no WhatsApp" />
      </div>
    </div>
  )
}
