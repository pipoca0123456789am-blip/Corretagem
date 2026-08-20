'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  Phase12State,
  RequestTimeline,
  StatusBadge,
  useUiLoad,
} from '@/components/professional/shared'
import {
  ProfessionalRequest,
  formatCurrency,
  getRealtorProfessionalRequest,
} from '@/lib/phase12-data'

export default function ProfessionalTrackingPage() {
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)

  useEffect(() => {
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Acompanhamento' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Acompanhamento</h1>
          <p className="text-sm text-muted-foreground">Linha do tempo clara do seu pedido</p>
        </div>

        <Phase12State
          state={!request && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Nenhuma solicitação',
            description: 'Contrate a página profissional para acompanhar aqui.',
            action: { label: 'Contratar', onClick: () => (window.location.href = '/professional/solicitar') },
          }}
        >
          {request ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{request.id}</h2>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Valor {formatCurrency(request.price)} · Responsável: {request.producer}
                </p>
                <p className="text-sm text-muted-foreground">Prazo: {request.dueDate}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">Pagamento: {request.paymentStatus}</Badge>
                  {request.paymentMethod ? <Badge variant="default">{request.paymentMethod}</Badge> : null}
                </div>
                <Alert
                  variant="info"
                  description="Esta tela mostra apenas a sua solicitação. Sem pagamento ou publicação reais."
                />
                <div className="flex flex-wrap gap-2">
                  {request.status === 'aguardando_pagamento' ? (
                    <Link href="/professional/checkout"><Button>Ir ao checkout</Button></Link>
                  ) : null}
                  {['aguardando_aprovacao_corretor', 'ajustes_solicitados'].includes(request.status) ? (
                    <Link href="/professional/aprovacao"><Button>Revisar e aprovar</Button></Link>
                  ) : null}
                  <Link href="/professional/ajustes"><Button variant="outline">Solicitar ajustes</Button></Link>
                  {request.status === 'publicado' ? (
                    <Link href="/professional/publicada"><Button variant="secondary">Ver publicada</Button></Link>
                  ) : null}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-semibold text-foreground">Linha do tempo</h3>
                <RequestTimeline request={request} />
              </div>
              <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
                <h3 className="mb-3 font-semibold text-foreground">Checklist de produção</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {request.checklist.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span>{item.label}</span>
                      <Badge variant={item.done ? 'success' : 'default'}>{item.done ? 'Feito' : 'Pendente'}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </Phase12State>
      </div>
    </div>
  )
}
