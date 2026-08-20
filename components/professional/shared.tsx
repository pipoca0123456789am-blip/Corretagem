'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/design-system/feedback/badge'
import { Progress } from '@/components/design-system/feedback/progress'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { Button } from '@/components/design-system/buttons/button'
import {
  PROFESSIONAL_PAGE_PRICE,
  ProfessionalRequest,
  ProfessionalRequestStatus,
  formatCurrency,
  professionalStatusBadge,
  professionalStatusLabels,
  timelineProgress,
} from '@/lib/phase12-data'

export function useUiLoad(delay = 280) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')

  const reload = () => {
    setState('loading')
    const timer = window.setTimeout(() => setState('ready'), delay)
    return () => window.clearTimeout(timer)
  }

  return { state, reload, setState }
}

export function Phase12State({
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
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (state === 'error') {
    return (
      <EmptyState
        title="Falha ao carregar"
        description="Tente novamente em instantes."
        action={onRetry ? { label: 'Tentar de novo', onClick: onRetry } : undefined}
      />
    )
  }
  if (state === 'empty' && empty) {
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />
  }
  return <>{children}</>
}

export function StatusBadge({ status }: { status: ProfessionalRequestStatus }) {
  return (
    <Badge variant={professionalStatusBadge[status]}>{professionalStatusLabels[status]}</Badge>
  )
}

export function RequestTimeline({ request }: { request: ProfessionalRequest }) {
  return (
    <div className="space-y-4">
      <Progress value={timelineProgress(request.status)} label="Progresso do pedido" />
      <ol className="space-y-3 border-l-2 border-border pl-4">
        {request.timeline.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
            <p className="text-sm font-medium text-foreground">{event.label}</p>
            <p className="text-xs text-muted-foreground">{event.at}</p>
            {event.note ? <p className="mt-1 text-xs text-muted-foreground">{event.note}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function PromoCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative min-h-[220px]">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop"
            alt="Página profissional"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="relative p-6 text-white">
            <Badge variant="warning">Serviço pontual</Badge>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">Página Profissional</h2>
            <p className="mt-2 text-sm text-white/85">
              Sua vitrine digital premium, produzida sob medida pela equipe ImóvelHub.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">Investimento inicial</p>
          <p className="text-4xl font-bold text-primary">{formatCurrency(PROFESSIONAL_PAGE_PRICE)}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Design exclusivo vinculado à sua marca</li>
            <li>• Leads e WhatsApp só para você</li>
            <li>• Produção assistida com revisões</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link href="/professional/beneficios">
              <Button variant="outline">Ver benefícios</Button>
            </Link>
            <Link href="/professional/solicitar">
              <Button>Quero contratar</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfirmActionModal({
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
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="tertiary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SuccessBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert className="mb-4" variant="success" description={message} onClose={onClose} />
}
