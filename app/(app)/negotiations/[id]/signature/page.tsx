'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Modal } from '@/components/design-system/feedback/modal'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Progress } from '@/components/design-system/feedback/progress'
import {
  Negotiation,
  filterByRealtor,
  initialNegotiations,
} from '@/lib/phase7-data'

export default function NegotiationSignaturePage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Negotiation | null>(null)
  const [status, setStatus] = useState<Negotiation['signatureStatus']>('nao_iniciada')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      const found =
        filterByRealtor(initialNegotiations).find((n) => n.id === id) || null
      setItem(found)
      setStatus(found?.signatureStatus || 'nao_iniciada')
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive" description="Negociação não encontrada." />
      </div>
    )
  }

  const progress =
    status === 'nao_iniciada' ? 0 : status === 'aguardando' ? 45 : status === 'assinada' ? 100 : 20

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Negociações', href: '/negotiations' },
          { label: item.code, href: `/negotiations/${item.id}` },
          { label: 'Assinatura' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Assinatura</h1>
          <p className="text-muted-foreground mt-1">Fluxo simulado de coleta de assinaturas</p>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <Alert
          variant="warning"
          title="Sem assinatura digital real"
          description="Nenhuma integração com provedores de assinatura eletrônica é realizada nesta fase."
        />

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-foreground">Status atual</p>
            <Badge
              variant={
                status === 'assinada'
                  ? 'success'
                  : status === 'recusada'
                    ? 'destructive'
                    : status === 'aguardando'
                      ? 'warning'
                      : 'default'
              }
            >
              {status.split('_').join(' ')}
            </Badge>
          </div>
          <Progress value={progress} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Comprador</p>
              <p className="font-medium text-foreground mt-1">{item.clientName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {status === 'assinada' ? 'Assinado (simulado)' : 'Aguardando'}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-muted-foreground">Vendedor</p>
              <p className="font-medium text-foreground mt-1">{item.ownerName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {status === 'assinada' ? 'Assinado (simulado)' : 'Aguardando'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setStatus('aguardando')
                setSuccess('Solicitação de assinatura enviada (simulada).')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Solicitar assinaturas
            </Button>
            <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
              Marcar como assinada
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setStatus('recusada')
                setSuccess('Assinatura marcada como recusada.')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Marcar recusa
            </Button>
            <Link href={`/negotiations/${item.id}/checklist`}>
              <Button variant="outline">Ir ao checklist</Button>
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar assinaturas"
        description="Confirma que todas as partes assinaram? (simulado)"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setStatus('assinada')
                setConfirmOpen(false)
                setSuccess('Assinaturas confirmadas com sucesso.')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Esta ação não gera certificado digital nem arquivo assinado.
        </p>
      </Modal>
    </div>
  )
}
