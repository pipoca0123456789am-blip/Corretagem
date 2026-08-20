'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  Phase12State,
  PromoCard,
  RequestTimeline,
  StatusBadge,
  useUiLoad,
} from '@/components/professional/shared'
import {
  ProfessionalRequest,
  formatCurrency,
  getRealtorProfessionalRequest,
  loadProfessionalRequests,
} from '@/lib/phase12-data'

export default function ProfessionalHubPage() {
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)

  useEffect(() => {
    loadProfessionalRequests()
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Pág. Profissional' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Página Profissional</h1>
            <p className="text-sm text-muted-foreground">
              Contratação e acompanhamento do serviço de R$ 497,00
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/professional/exemplos">
              <Button variant="outline">Exemplos</Button>
            </Link>
            <Link href="/professional/modelos">
              <Button variant="outline">Modelos</Button>
            </Link>
          </div>
        </div>

        <Phase12State state={state} onRetry={reload}>
          {!request || request.status === 'cancelado' ? (
            <>
              <PromoCard />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { href: '/professional/beneficios', label: 'Benefícios' },
                  { href: '/professional/comparacao', label: 'Antes e depois' },
                  { href: '/professional/modelos', label: 'Modelos visuais' },
                  { href: '/professional/solicitar', label: 'Solicitar agora' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Sua solicitação</h2>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Pedido {request.id} · {formatCurrency(request.price)} · Prazo {request.dueDate}
                </p>
                <Alert
                  variant="info"
                  title="Escopo individual"
                  description="Você visualiza somente a sua solicitação. Pagamento e upload são simulados."
                />
                <div className="flex flex-wrap gap-2">
                  <Link href="/professional/acompanhamento">
                    <Button>Acompanhar</Button>
                  </Link>
                  {request.status === 'aguardando_pagamento' ? (
                    <Link href="/professional/checkout">
                      <Button variant="secondary">Checkout</Button>
                    </Link>
                  ) : null}
                  {request.status === 'aguardando_aprovacao_corretor' ||
                  request.status === 'ajustes_solicitados' ? (
                    <Link href="/professional/aprovacao">
                      <Button variant="secondary">Aprovar / ajustes</Button>
                    </Link>
                  ) : null}
                  {request.status === 'publicado' ? (
                    <>
                      <Link href="/professional/publicada">
                        <Button variant="secondary">Página publicada</Button>
                      </Link>
                      <Link href="/professional/metricas">
                        <Button variant="outline">Métricas</Button>
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-3 font-semibold text-foreground">Linha do tempo</h3>
                <RequestTimeline request={request} />
              </div>
            </div>
          )}
        </Phase12State>
      </div>
    </div>
  )
}
