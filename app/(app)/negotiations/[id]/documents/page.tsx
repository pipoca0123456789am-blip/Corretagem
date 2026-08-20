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
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import {
  Negotiation,
  NegotiationDocument,
  filterByRealtor,
  formatDateBR,
  initialNegotiations,
} from '@/lib/phase7-data'
import { FileWarning } from 'lucide-react'

const docBadge = (status: NegotiationDocument['status']) => {
  const map = {
    pendente: 'warning' as const,
    enviado: 'info' as const,
    aprovado: 'success' as const,
    rejeitado: 'destructive' as const,
  }
  return map[status]
}

const docLabel = {
  pendente: 'Pendente',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
}

export default function NegotiationDocumentsPage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Negotiation | null>(null)
  const [success, setSuccess] = useState('')
  const [confirmDoc, setConfirmDoc] = useState<{
    doc: NegotiationDocument
    action: 'enviar' | 'aprovar' | 'rejeitar'
  } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setItem(
        filterByRealtor(initialNegotiations).find((n) => n.id === id) || null
      )
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  const applyDocAction = () => {
    if (!item || !confirmDoc) return
    const { doc, action } = confirmDoc
    const nextStatus =
      action === 'enviar' ? 'enviado' : action === 'aprovar' ? 'aprovado' : 'rejeitado'
    setItem({
      ...item,
      documents: item.documents.map((d) =>
        d.id === doc.id ? { ...d, status: nextStatus } : d
      ),
      updatedAt: new Date().toISOString(),
    })
    setConfirmDoc(null)
    setSuccess(`Documento "${doc.name}" atualizado.`)
    setTimeout(() => setSuccess(''), 3000)
  }

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

  const pending = item.documents.filter((d) => d.status === 'pendente')

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Negociações', href: '/negotiations' },
          { label: item.code, href: `/negotiations/${item.id}` },
          { label: 'Documentos' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Documentos pendentes</h1>
            <p className="text-muted-foreground mt-1">
              Checklist documental da negociação {item.code}
            </p>
          </div>
          <Link href={`/negotiations/${item.id}`}>
            <Button variant="outline">Voltar à negociação</Button>
          </Link>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <Alert
          variant="info"
          title={`${pending.length} documento(s) pendente(s)`}
          description="Envios e validações são simulados — nenhum arquivo real é armazenado."
        />

        {item.documents.length === 0 ? (
          <EmptyState
            icon={<FileWarning className="w-8 h-8" />}
            title="Sem documentos"
            description="Nenhum documento vinculado a esta negociação."
          />
        ) : (
          <div className="space-y-3">
            {item.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <Badge variant={docBadge(doc.status)}>{docLabel[doc.status]}</Badge>
                    {doc.required && <Badge variant="default">Obrigatório</Badge>}
                  </div>
                  {doc.dueDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Prazo: {formatDateBR(doc.dueDate)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {doc.status === 'pendente' && (
                    <Button size="sm" variant="primary" onClick={() => setConfirmDoc({ doc, action: 'enviar' })}>
                      Marcar enviado
                    </Button>
                  )}
                  {doc.status === 'enviado' && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setConfirmDoc({ doc, action: 'aprovar' })}>
                        Aprovar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setConfirmDoc({ doc, action: 'rejeitar' })}>
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!confirmDoc}
        onClose={() => setConfirmDoc(null)}
        title="Confirmar ação no documento"
        description={
          confirmDoc
            ? `Deseja ${confirmDoc.action} o documento "${confirmDoc.doc.name}"?`
            : undefined
        }
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmDoc(null)}>Cancelar</Button>
            <Button
              variant={confirmDoc?.action === 'rejeitar' ? 'danger' : 'primary'}
              onClick={applyDocAction}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Ação simulada para demonstração do fluxo.</p>
      </Modal>
    </div>
  )
}
