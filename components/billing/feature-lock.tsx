'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Modal } from '@/components/design-system/feedback/modal'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { getFeature, type FeatureId, type PlanId } from '@/lib/plan-access'

const planNames: Record<PlanId, string> = {
  essencial: 'Essencial',
  profissional: 'Profissional',
  premium: 'Premium',
}

export function UpgradeLockModal({
  open,
  onClose,
  featureId,
  currentPlanId,
}: {
  open: boolean
  onClose: () => void
  featureId: FeatureId
  currentPlanId?: PlanId
}) {
  const feature = getFeature(featureId)
  const minPlan = feature.minPlan

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Recurso bloqueado no seu plano"
      description={feature.lockMessage}
      size="md"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Fechar
          </Button>
          <Link href={`/plans?upgrade=${minPlan}`}>
            <Button onClick={onClose}>{feature.upgradeCta}</Button>
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-foreground">{feature.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {feature.benefits.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-2">
          {currentPlanId ? (
            <Badge variant="default">Plano atual: {planNames[currentPlanId]}</Badge>
          ) : null}
          <Badge variant="primary">Disponível a partir do {planNames[minPlan]}</Badge>
        </div>
      </div>
    </Modal>
  )
}

export function FeatureLockBadge({ className }: { className?: string }) {
  return (
    <Badge variant="warning" className={className}>
      <Lock className="mr-1 h-3 w-3" />
      Bloqueado
    </Badge>
  )
}

export function LockedMenuItem({
  label,
  locked,
  active,
  onOpen,
  href,
  onNavigate,
}: {
  label: string
  locked: boolean
  active?: boolean
  onOpen?: () => void
  href: string
  onNavigate?: () => void
}) {
  if (locked) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2 text-left transition-colors ${
          active
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/20'
        }`}
      >
        <span className="text-sm font-medium">{label}</span>
        <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </button>
    )
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-colors ${
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
