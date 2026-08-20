'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  FileText,
  PenLine,
  CheckSquare,
  PartyPopper,
  Send,
  Ban,
  RefreshCw,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Modal } from '@/components/design-system/feedback/modal'
import { Alert } from '@/components/design-system/feedback/alert'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import {
  Negotiation,
  NegotiationStatus,
  TimelineEvent,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialNegotiations,
  negotiationStatusBadge,
  negotiationStatusLabels,
} from '@/lib/phase7-data'

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
            {index < events.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
          </div>
          <div className="pb-6 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground text-sm">{event.title}</p>
              <Badge variant="default">{event.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateBR(event.date)} · {event.time} · {event.actor}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NegotiationDetailPage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Negotiation | null>(null)
  const [success, setSuccess] = useState('')
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterValue, setCounterValue] = useState('')
  const [counterNotes, setCounterNotes] = useState('')
  const [statusOpen, setStatusOpen] = useState(false)
  const [nextStatus, setNextStatus] = useState<NegotiationStatus>('em_negociacao')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const found = filterByRealtor(initialNegotiations).find((n) => n.id === id) || null
      setItem(found)
      setLoading(false)
    }, 450)
    return () => clearTimeout(t)
  }, [id])

  const pushTimeline = (
    current: Negotiation,
    title: string,
    description: string,
    type: TimelineEvent['type'],
    status?: NegotiationStatus
  ): Negotiation => {
    const event: TimelineEvent = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      title,
      description,
      actor: current.realtorName,
      type,
    }
    return {
      ...current,
      status: status || current.status,
      timeline: [...current.timeline, event],
      updatedAt: new Date().toISOString(),
    }
  }

  const flash = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Alert
          variant="destructive"
          title="Negociação não encontrada"
          description="Esta negociação não existe ou não pertence à sua carteira."
        />
        <Link href="/negotiations">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    )
  }

  const pendingDocs = item.documents.filter((d) => d.status === 'pendente').length

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Negociações', href: '/negotiations' },
          { label: item.code },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{item.code}</h1>
              <Badge variant={negotiationStatusBadge(item.status)}>
                {negotiationStatusLabels[item.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{item.propertyTitle}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.propertyAddress}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCounterOpen(true)}>
              <RefreshCw className="w-4 h-4" />
              Contraproposta
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setApproveOpen(true)}>
              Aprovar
            </Button>
            <Button variant="danger" size="sm" onClick={() => setRejectOpen(true)}>
              Rejeitar
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => setStatusOpen(true)}>
              Alterar status
            </Button>
          </div>
        </div>

        {success && (
          <Alert variant="success" title="Sucesso" description={success} onClose={() => setSuccess('')} />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {[
            { href: `/negotiations/${item.id}/documents`, label: 'Documentos', icon: FileText, badge: pendingDocs },
            { href: `/negotiations/${item.id}/contract`, label: 'Contrato', icon: FileText },
            { href: `/negotiations/${item.id}/signature`, label: 'Assinatura', icon: PenLine },
            { href: `/negotiations/${item.id}/checklist`, label: 'Checklist', icon: CheckSquare },
            { href: `/negotiations/${item.id}/complete`, label: 'Conclusão', icon: PartyPopper },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-card border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <link.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{link.label}</span>
                {link.badge ? (
                  <Badge variant="warning">{link.badge}</Badge>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <h2 className="font-semibold text-foreground mb-4">Dados da negociação</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <p><span className="text-muted-foreground">Cliente:</span> {item.clientName}</p>
                <p><span className="text-muted-foreground">Telefone:</span> {item.clientPhone}</p>
                <p><span className="text-muted-foreground">E-mail:</span> {item.clientEmail}</p>
                <p><span className="text-muted-foreground">Proprietário:</span> {item.ownerName}</p>
                <p><span className="text-muted-foreground">Corretor:</span> {item.realtorName}</p>
                <p><span className="text-muted-foreground">Prazo:</span> {formatDateBR(item.deadline)}</p>
                <p><span className="text-muted-foreground">Valor solicitado:</span> {formatCurrency(item.requestedValue)}</p>
                <p><span className="text-muted-foreground">Valor ofertado:</span> {formatCurrency(item.offeredValue)}</p>
                <p><span className="text-muted-foreground">Entrada:</span> {formatCurrency(item.downPayment)}</p>
                <p><span className="text-muted-foreground">Financiamento:</span> {formatCurrency(item.financing)}</p>
                <p><span className="text-muted-foreground">Comissão:</span> {item.commissionPercent}% ({formatCurrency(item.commissionValue)})</p>
                <p className="sm:col-span-2"><span className="text-muted-foreground">Condições:</span> {item.conditions}</p>
                <p className="sm:col-span-2"><span className="text-muted-foreground">Observações:</span> {item.observations || '—'}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <h2 className="font-semibold text-foreground mb-4">Linha do tempo</h2>
              <Timeline events={item.timeline} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Ações rápidas</h3>
              <Button
                className="w-full"
                variant="outline"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => {
                  setItem((prev) =>
                    prev
                      ? pushTimeline(
                          prev,
                          'Proposta enviada',
                          'Proposta reenviada ao proprietário (simulado).',
                          'proposta',
                          'proposta_enviada'
                        )
                      : prev
                  )
                  flash('Proposta marcada como enviada.')
                }}
              >
                Enviar proposta
              </Button>
              <Button
                className="w-full"
                variant="outline"
                leftIcon={<Ban className="w-4 h-4" />}
                onClick={() => setCancelOpen(true)}
              >
                Cancelar negociação
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Documentos</h3>
              <p className="text-sm text-muted-foreground">
                {pendingDocs} pendente(s) de {item.documents.length}
              </p>
              <Link href={`/negotiations/${item.id}/documents`}>
                <Button variant="primary" className="w-full" size="sm">
                  Gerenciar documentos
                </Button>
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-foreground">Fechamento</h3>
              <p className="text-sm text-muted-foreground">
                Checklist: {item.checklist.filter((c) => c.done).length}/{item.checklist.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Assinatura: {item.signatureStatus.split('_').join(' ')}
              </p>
              <Link href={`/negotiations/${item.id}/checklist`}>
                <Button variant="secondary" className="w-full" size="sm">
                  Abrir checklist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={counterOpen}
        onClose={() => setCounterOpen(false)}
        title="Registrar contraproposta"
        description="Simule uma contraproposta na linha do tempo"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setCounterOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                const value = Number(counterValue)
                if (!value) return
                setItem((prev) => {
                  if (!prev) return prev
                  const updated = pushTimeline(
                    { ...prev, offeredValue: value },
                    'Contraproposta',
                    `Novo valor: ${formatCurrency(value)}. ${counterNotes || ''}`.trim(),
                    'contraproposta',
                    'contraproposta'
                  )
                  return {
                    ...updated,
                    offeredValue: value,
                    commissionValue: Math.round(value * (prev.commissionPercent / 100)),
                  }
                })
                setCounterOpen(false)
                setCounterValue('')
                setCounterNotes('')
                flash('Contraproposta registrada.')
              }}
            >
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Novo valor (R$)"
            type="number"
            value={counterValue}
            onChange={(e) => setCounterValue(e.target.value)}
          />
          <Textarea
            label="Observações"
            value={counterNotes}
            onChange={(e) => setCounterNotes(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Alterar status"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setStatusOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setItem((prev) =>
                  prev
                    ? pushTimeline(
                        prev,
                        negotiationStatusLabels[nextStatus],
                        `Status atualizado para ${negotiationStatusLabels[nextStatus]}.`,
                        'status',
                        nextStatus
                      )
                    : prev
                )
                setStatusOpen(false)
                flash('Status atualizado.')
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
          onChange={(e) => setNextStatus(e.target.value as NegotiationStatus)}
          options={Object.entries(negotiationStatusLabels).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </Modal>

      <Modal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        title="Aprovar proposta"
        description="Confirma a aprovação desta negociação?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setApproveOpen(false)}>Voltar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setItem((prev) =>
                  prev
                    ? pushTimeline(
                        prev,
                        'Aprovada',
                        'Proposta aprovada pelas partes (simulado).',
                        'aprovacao',
                        'aprovada'
                      )
                    : prev
                )
                setApproveOpen(false)
                flash('Negociação aprovada.')
              }}
            >
              Aprovar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Valor atual: {formatCurrency(item.offeredValue)}
        </p>
      </Modal>

      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Rejeitar proposta"
        description="A negociação será marcada como recusada."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setRejectOpen(false)}>Voltar</Button>
            <Button
              variant="danger"
              onClick={() => {
                setItem((prev) =>
                  prev
                    ? pushTimeline(
                        prev,
                        'Recusada',
                        'Proposta recusada (simulado).',
                        'status',
                        'recusada'
                      )
                    : prev
                )
                setRejectOpen(false)
                flash('Negociação recusada.')
              }}
            >
              Rejeitar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">{item.code} · {item.clientName}</p>
      </Modal>

      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancelar negociação"
        description="Esta ação marcará a negociação como cancelada."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setCancelOpen(false)}>Voltar</Button>
            <Button
              variant="danger"
              onClick={() => {
                setItem((prev) =>
                  prev
                    ? pushTimeline(
                        prev,
                        'Cancelada',
                        'Negociação cancelada pelo corretor.',
                        'status',
                        'cancelada'
                      )
                    : prev
                )
                setCancelOpen(false)
                flash('Negociação cancelada.')
              }}
            >
              Confirmar cancelamento
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">{item.code}</p>
      </Modal>
    </div>
  )
}
