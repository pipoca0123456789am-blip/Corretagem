'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  RequestStatusBadge,
  SupportState,
  Timeline,
  useSupportLoad,
} from '@/components/support/shared'
import {
  ServiceRequest,
  formatCurrency,
  getRequestById,
  requestTypeLabels,
} from '@/lib/phase16-data'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useSupportLoad()
  const [item, setItem] = useState<ServiceRequest | null>(null)

  useEffect(() => {
    setItem(getRequestById(id) || null)
  }, [id, state])

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Solicitações', href: '/solicitacoes' },
          { label: id },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <SupportState
          state={state === 'ready' && !item ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Solicitação não encontrada',
            description: 'Ela não existe ou não pertence à sua conta.',
            action: { label: 'Voltar', onClick: () => router.push('/solicitacoes') },
          }}
        >
          {item ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                    <RequestStatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {requestTypeLabels[item.type]} · {item.id}
                    {typeof item.amount === 'number' ? ` · ${formatCurrency(item.amount)}` : ''}
                  </p>
                </div>
                <Link href="/solicitacoes">
                  <Button variant="outline">Voltar</Button>
                </Link>
              </div>

              <Alert
                variant="info"
                description="Observações internas da equipe não são exibidas para o corretor."
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">Descrição</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  {item.assigneeName ? (
                    <p className="mt-4 text-sm text-foreground">Responsável: {item.assigneeName}</p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Histórico</h2>
                  <Timeline events={item.timeline} />
                </div>
              </div>
            </>
          ) : null}
        </SupportState>
      </div>
    </div>
  )
}
