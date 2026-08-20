'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  ConfirmActionModal,
  Phase12State,
  StatusBadge,
  useUiLoad,
} from '@/components/professional/shared'
import {
  ProfessionalRequest,
  getRealtorProfessionalRequest,
  updateRequestStatus,
  upsertProfessionalRequest,
} from '@/lib/phase12-data'

export default function ProfessionalApprovalPage() {
  const router = useRouter()
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  const approve = () => {
    if (!request) return
    const updated = updateRequestStatus(request.id, 'aprovado', 'Aprovado pelo corretor')
    if (updated) {
      const published = updateRequestStatus(updated.id, 'publicado', 'Publicação simulada')
      if (published) {
        upsertProfessionalRequest({
          ...published,
          checklist: published.checklist.map((c) => ({ ...c, done: true })),
          publishedUrl: `/corretor/${published.form.slug}`,
          metrics: published.metrics || {
            visits: 120,
            leads: 8,
            whatsappClicks: 24,
            conversionRate: 2.1,
            periodLabel: 'Desde a publicação',
          },
        })
      }
    }
    setConfirmOpen(false)
    setSuccess('Página aprovada e publicada (simulado).')
    setTimeout(() => router.push('/professional/publicada'), 800)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Aprovação' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aprovação final</h1>
          <p className="text-sm text-muted-foreground">Revise o resultado e confirme a publicação</p>
        </div>
        {success ? <Alert variant="success" description={success} /> : null}
        <Phase12State
          state={!request && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Nada para aprovar', description: 'Aguarde a produção enviar a revisão.' }}
        >
          {request ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={request.status} />
                <span className="text-sm text-muted-foreground">Modelo em revisão</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=700&fit=crop"
                  alt="Preview"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Preview ilustrativo da página de {request.form.fullName}. Publicação real não ocorre nesta fase.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setConfirmOpen(true)}>Aprovar e publicar</Button>
                <Link href="/professional/ajustes">
                  <Button variant="outline">Pedir ajustes</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </Phase12State>

        <ConfirmActionModal
          open={confirmOpen}
          title="Confirmar aprovação final?"
          description="Ao confirmar, o status mudará para Aprovado e depois Publicado (simulação)."
          confirmLabel="Sim, aprovar"
          onClose={() => setConfirmOpen(false)}
          onConfirm={approve}
        />
      </div>
    </div>
  )
}
