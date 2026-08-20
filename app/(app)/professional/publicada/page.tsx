'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { Phase12State, StatusBadge, useUiLoad } from '@/components/professional/shared'
import {
  ProfessionalRequest,
  getRealtorProfessionalRequest,
} from '@/lib/phase12-data'

export default function ProfessionalPublishedPage() {
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)

  useEffect(() => {
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  const published = request?.status === 'publicado'

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Publicada' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Página publicada</h1>
          <p className="text-sm text-muted-foreground">Sua vitrine profissional no ImóvelHub</p>
        </div>
        <Phase12State
          state={state === 'ready' && !published ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Página ainda não publicada',
            description: 'Conclua aprovação para visualizar esta etapa.',
            action: { label: 'Ver acompanhamento', onClick: () => (window.location.href = '/professional/acompanhamento') },
          }}
        >
          {request && published ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={request.status} />
                <span className="text-sm text-muted-foreground">{request.publishedUrl}</span>
              </div>
              <Alert
                variant="success"
                title="No ar (simulado)"
                description="A publicação é conceitual. O link abaixo abre a vitrine pública existente."
              />
              <div className="flex flex-wrap gap-2">
                <Link href={request.publishedUrl || `/corretor/${request.form.slug}`}>
                  <Button>Abrir página pública</Button>
                </Link>
                <Link href="/professional/metricas">
                  <Button variant="outline">Ver métricas</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </Phase12State>
      </div>
    </div>
  )
}
