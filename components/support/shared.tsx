'use client'

import { useState } from 'react'
import { Badge } from '@/components/design-system/feedback/badge'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { Button } from '@/components/design-system/buttons/button'
import {
  TicketPriority,
  TicketStatus,
  RequestStatus,
  priorityBadge,
  priorityLabels,
  requestStatusBadge,
  requestStatusLabels,
  ticketStatusBadge,
  ticketStatusLabels,
  slaProgress,
  SupportTicket,
} from '@/lib/phase16-data'

export function useSupportLoad(delay = 250) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const reload = () => {
    setState('loading')
    window.setTimeout(() => setState('ready'), delay)
  }
  return { state, reload, setState }
}

export function SupportState({
  state,
  onRetry,
  empty,
  children,
}: {
  state: 'loading' | 'ready' | 'error' | 'empty'
  onRetry?: () => void
  empty?: { title: string; description?: string; action?: { label: string; onClick: () => void } }
  children: React.ReactNode
}) {
  if (state === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  if (state === 'error') {
    return (
      <EmptyState
        title="Falha ao carregar"
        description="Tente novamente. Nenhum dado foi enviado a um servidor real."
        action={onRetry ? { label: 'Tentar de novo', onClick: onRetry } : undefined}
      />
    )
  }
  if (state === 'empty' && empty) {
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />
  }
  return <>{children}</>
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={ticketStatusBadge[status]}>{ticketStatusLabels[status]}</Badge>
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge variant={priorityBadge[priority]}>{priorityLabels[priority]}</Badge>
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={requestStatusBadge[status]}>{requestStatusLabels[status]}</Badge>
}

export function SuccessNote({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert className="mb-4" variant="success" description={message} onClose={onClose} />
}

export function SlaBar({ ticket }: { ticket: SupportTicket }) {
  const sla = slaProgress(ticket)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className={sla.breached ? 'text-destructive' : 'text-muted-foreground'}>{sla.label}</span>
        <span className="text-muted-foreground">{sla.percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${sla.breached ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${sla.percent}%` }}
        />
      </div>
    </div>
  )
}

export function Timeline({
  events,
}: {
  events: { id: string; label: string; at: string; actor: string }[]
}) {
  return (
    <ul className="space-y-3">
      {events.map((e, i) => (
        <li key={e.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
            {i < events.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
          </div>
          <div className="pb-3">
            <p className="text-sm font-medium text-foreground">{e.label}</p>
            <p className="text-xs text-muted-foreground">
              {e.actor} · {e.at}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="tertiary" onClick={onClose}>
            Voltar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SimulatedAttachments({
  names,
  onAdd,
  readOnly,
}: {
  names: string[]
  onAdd?: (name: string) => void
  readOnly?: boolean
}) {
  return (
    <div className="space-y-2">
      {names.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo simulado.</p>
      ) : (
        <ul className="space-y-1">
          {names.map((n) => (
            <li
              key={n}
              className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
            >
              📎 {n} <span className="text-xs text-muted-foreground">(simulado)</span>
            </li>
          ))}
        </ul>
      )}
      {!readOnly && onAdd ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onAdd(`anexo-${names.length + 1}.pdf`)}
        >
          Adicionar anexo simulado
        </Button>
      ) : null}
    </div>
  )
}
