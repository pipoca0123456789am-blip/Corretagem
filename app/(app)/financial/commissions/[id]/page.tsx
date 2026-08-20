'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { Select } from '@/components/design-system/forms/select'
import {
  Commission,
  CommissionStatus,
  commissionStatusBadge,
  commissionStatusLabels,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialCommissions,
} from '@/lib/phase8-data'

export default function CommissionDetailPage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Commission | null>(null)
  const [success, setSuccess] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<CommissionStatus>('aprovada')
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setItem(
        filterByRealtor(initialCommissions).find((c) => c.id === id) ||
          initialCommissions.find((c) => c.id === id) ||
          null
      )
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Alert
          variant="destructive"
          title="Comissão não encontrada"
          description="Esta comissão não existe ou não pertence à sua carteira."
        />
        <Link href="/financial/commissions">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Financeiro', href: '/financial' },
          { label: 'Comissões', href: '/financial/commissions' },
          { label: item.code },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-5xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{item.code}</h1>
              <Badge variant={commissionStatusBadge(item.status)}>
                {commissionStatusLabels[item.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{item.propertyTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setStatusOpen(true)}>
              Alterar status
            </Button>
            {item.status !== 'cancelada' && (
              <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                Cancelar
              </Button>
            )}
            <Link href={`/negotiations`}>
              <Button variant="tertiary" size="sm">Ver negociações</Button>
            </Link>
          </div>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <p><span className="text-muted-foreground">Imóvel:</span> {item.propertyTitle}</p>
              <p><span className="text-muted-foreground">Endereço:</span> {item.propertyAddress}</p>
              <p><span className="text-muted-foreground">Cliente:</span> {item.clientName}</p>
              <p><span className="text-muted-foreground">Negociação:</span> {item.negotiationCode}</p>
              <p><span className="text-muted-foreground">Tipo:</span> {item.dealType === 'venda' ? 'Venda' : 'Locação'}</p>
              <p><span className="text-muted-foreground">Valor do negócio:</span> {formatCurrency(item.dealValue)}</p>
              <p><span className="text-muted-foreground">Percentual:</span> {item.percent}%</p>
              <p><span className="text-muted-foreground">Valor da comissão:</span> {formatCurrency(item.commissionValue)}</p>
              <p><span className="text-muted-foreground">Divisão:</span> {item.splitPercent}% {item.splitPartner ? `(parceiro: ${item.splitPartner})` : ''}</p>
              <p><span className="text-muted-foreground">Data prevista:</span> {formatDateBR(item.expectedDate)}</p>
              <p><span className="text-muted-foreground">Data recebida:</span> {item.receivedDate ? formatDateBR(item.receivedDate) : '—'}</p>
              <p><span className="text-muted-foreground">Valor pago:</span> {formatCurrency(item.paidAmount)}</p>
              <p><span className="text-muted-foreground">Corretor:</span> {item.realtorName}</p>
              <p className="sm:col-span-2"><span className="text-muted-foreground">Observações:</span> {item.observations || '—'}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <h2 className="font-semibold text-foreground mb-4">Histórico</h2>
              <div className="space-y-0">
                {item.history.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                      {index < item.history.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="pb-5">
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateBR(event.date)}</p>
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Anexos e comprovantes</h3>
              {item.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
              ) : (
                item.attachments.map((file) => (
                  <div key={file.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.kind} · {formatDateBR(file.uploadedAt)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setSuccess('Visualização do comprovante simulada.')
                        setTimeout(() => setSuccess(''), 2500)
                      }}
                    >
                      Ver anexo
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Alterar status da comissão"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setStatusOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: nextStatus,
                        history: [
                          ...prev.history,
                          {
                            id: `h-${Date.now()}`,
                            date: '2026-07-28',
                            title: commissionStatusLabels[nextStatus],
                            description: 'Status atualizado manualmente (simulado).',
                          },
                        ],
                        updatedAt: new Date().toISOString(),
                      }
                    : prev
                )
                setStatusOpen(false)
                setSuccess('Status da comissão atualizado.')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <Select
          label="Novo status"
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as CommissionStatus)}
          options={Object.entries(commissionStatusLabels).map(([value, label]) => ({ value, label }))}
        />
      </Modal>

      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancelar comissão"
        description="Confirma o cancelamento desta comissão?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setCancelOpen(false)}>Voltar</Button>
            <Button
              variant="danger"
              onClick={() => {
                setItem((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: 'cancelada',
                        history: [
                          ...prev.history,
                          {
                            id: `h-${Date.now()}`,
                            date: '2026-07-28',
                            title: 'Cancelada',
                            description: 'Comissão cancelada pelo usuário.',
                          },
                        ],
                      }
                    : prev
                )
                setCancelOpen(false)
                setSuccess('Comissão cancelada.')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Confirmar cancelamento
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">{item.code} · {formatCurrency(item.commissionValue)}</p>
      </Modal>
    </div>
  )
}
