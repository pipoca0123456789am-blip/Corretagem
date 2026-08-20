'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/design-system/feedback/badge'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Alert } from '@/components/design-system/feedback/alert'
import { Button } from '@/components/design-system/buttons/button'
import {
  AI_INTEGRATION_PRICE,
  AI_PRICE_PROVISIONAL,
  AiIntegrationStatus,
  aiStatusBadge,
  aiStatusLabels,
  formatCurrency,
} from '@/lib/phase13-data'

export function useAiLoad(delay = 280) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('ready')
  const reload = () => {
    setState('loading')
    window.setTimeout(() => setState('ready'), delay)
  }
  return { state, reload, setState }
}

export function AiPageState({
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

export function AiStatusBadge({ status }: { status: AiIntegrationStatus }) {
  return <Badge variant={aiStatusBadge[status]}>{aiStatusLabels[status]}</Badge>
}

export function AiPromoCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[220px]">
          <img
            src="https://images.unsplash.com/photo-1611162617474-5b21e764f988?w=1200&h=800&fit=crop"
            alt="IA WhatsApp"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-transparent" />
          <div className="relative space-y-2 p-6 text-white">
            <Badge variant="warning">WhatsApp + IA</Badge>
            <h2 className="text-2xl font-bold md:text-3xl">IA individual do corretor</h2>
            <p className="text-sm text-white/85">
              Agente isolado, treinado só com a sua carteira, clientes e tom de voz.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Valor inicial sugerido</p>
            <p className="text-4xl font-bold text-primary">{formatCurrency(AI_INTEGRATION_PRICE)}</p>
            {AI_PRICE_PROVISIONAL ? (
              <Badge className="mt-2" variant="info">
                Valor provisório
              </Badge>
            ) : null}
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Sem misturar imóveis ou conversas de outros corretores</li>
            <li>• Qualificação, follow-up e transferência humana</li>
            <li>• Sem IA real nem WhatsApp real nesta fase</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link href="/ai/beneficios">
              <Button variant="outline">Benefícios</Button>
            </Link>
            <Link href="/ai/solicitar">
              <Button>Contratar IA</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfirmModal({
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

export function SuccessNote({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert className="mb-4" variant="success" description={message} onClose={onClose} />
}
