'use client'

import Link from 'next/link'
import { MessageCircle, Phone, Star } from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Modal } from '@/components/design-system/feedback/modal'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { useState } from 'react'

export default function ClientMyRealtorPage() {
  const { slug, profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [talkOpen, setTalkOpen] = useState(false)
  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Corretor</h1>
        <p className="text-sm text-muted-foreground">Você está vinculado exclusivamente a este profissional</p>
      </div>

      <PageState state={state} onRetry={reload}>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <img src={profile.photo} alt={profile.name} className="mx-auto h-40 w-40 rounded-2xl object-cover" />
            <h2 className="mt-4 text-center text-xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-center text-sm text-muted-foreground">{profile.creci}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Badge variant="primary">{profile.accentLabel}</Badge>
              <Badge variant="success">
                <Star className="mr-1 inline h-3 w-3" />
                {profile.rating}
              </Badge>
            </div>
            <div className="mt-5 space-y-2">
              <Button className="w-full" leftIcon={<MessageCircle className="h-4 w-4" />} onClick={() => setTalkOpen(true)}>
                Falar com o corretor
              </Button>
              <Link href={`/cliente/${slug}/mensagens`}>
                <Button variant="outline" className="w-full">Abrir mensagens</Button>
              </Link>
              <Link href={`/corretor/${profile.slug}`}>
                <Button variant="tertiary" className="w-full">Ver página pública</Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <Alert
              variant="info"
              title="Vínculo exclusivo"
              description="Imóveis, propostas e documentos desta área pertencem somente a este corretor."
            />
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground">{profile.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {profile.phone}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.specialties.map((item) => (
                  <Badge key={item} variant="default">{item}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageState>

      <Modal
        isOpen={talkOpen}
        onClose={() => setTalkOpen(false)}
        title="Falar com o corretor"
        description="Contato simulado"
        footer={<Button onClick={() => setTalkOpen(false)}>Fechar</Button>}
      >
        <p className="text-sm text-muted-foreground">
          Em produção, este atalho abriria WhatsApp/chat com {profile.name} ({profile.phone}).
        </p>
      </Modal>
    </div>
  )
}
