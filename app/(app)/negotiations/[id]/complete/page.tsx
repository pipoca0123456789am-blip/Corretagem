'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PartyPopper } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { Modal } from '@/components/design-system/feedback/modal'
import { Badge } from '@/components/design-system/feedback/badge'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import {
  Negotiation,
  filterByRealtor,
  formatCurrency,
  initialNegotiations,
} from '@/lib/phase7-data'

export default function NegotiationCompletePage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Negotiation | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const found =
        filterByRealtor(initialNegotiations).find((n) => n.id === id) || null
      setItem(found)
      setClosed(found?.status === 'fechada')
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
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

  const requiredDone = item.checklist.filter((c) => c.required).every((c) => c.done) || closed

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Negociações', href: '/negotiations' },
          { label: item.code, href: `/negotiations/${item.id}` },
          { label: 'Conclusão' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Conclusão da negociação</h1>
          <p className="text-muted-foreground mt-1">Finalize o ciclo comercial do negócio</p>
        </div>

        {(closed || item.status === 'fechada') && (
          <Alert
            variant="success"
            title="Negociação concluída"
            description="Parabéns! O fechamento foi registrado com sucesso (simulado)."
          />
        )}

        {!requiredDone && !closed && (
          <Alert
            variant="warning"
            title="Checklist incompleto"
            description="Conclua os itens obrigatórios do checklist antes de fechar a negociação."
          />
        )}

        <div className="bg-card border border-border rounded-lg p-6 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{item.propertyTitle}</h2>
            <p className="text-muted-foreground mt-1">
              {item.clientName} · {formatCurrency(item.offeredValue)}
            </p>
          </div>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="primary">Comissão {formatCurrency(item.commissionValue)}</Badge>
            <Badge variant={closed ? 'success' : 'warning'}>
              {closed ? 'Fechada' : 'Aguardando fechamento'}
            </Badge>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {!closed && (
              <Button
                variant="primary"
                disabled={!requiredDone && item.status !== 'aprovada' && item.status !== 'documentacao'}
                onClick={() => setConfirmOpen(true)}
              >
                Concluir negociação
              </Button>
            )}
            <Link href={`/negotiations/${item.id}`}>
              <Button variant="outline">Voltar aos detalhes</Button>
            </Link>
            <Link href="/negotiations">
              <Button variant="tertiary">Lista de negociações</Button>
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar conclusão"
        description="Deseja marcar esta negociação como fechada?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setClosed(true)
                setConfirmOpen(false)
              }}
            >
              Confirmar fechamento
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Comissão estimada: {formatCurrency(item.commissionValue)}. Nenhuma notificação real será enviada.
        </p>
      </Modal>
    </div>
  )
}
