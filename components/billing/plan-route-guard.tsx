'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { findFeatureByPath, isFeatureIncludedInPlan, type FeatureDefinition } from '@/lib/plan-access'
import { getEffectivePlanId, getRealtorSubscription } from '@/lib/phase14-data'

const planNames = {
  essencial: 'Essencial',
  profissional: 'Profissional',
  premium: 'Premium',
} as const

/** Rotas de billing/planos sempre liberadas. */
const ALWAYS_ALLOWED = ['/plans', '/assinatura', '/profile', '/configuracoes', '/settings', '/suporte', '/help', '/notificacoes', '/solicitacoes']

function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

export function PlanRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [lockedFeature, setLockedFeature] = useState<FeatureDefinition | null>(null)
  const [planId, setPlanId] = useState(getEffectivePlanId())

  useEffect(() => {
    const sub = getRealtorSubscription()
    const effective = getEffectivePlanId(sub)
    setPlanId(effective)

    if (isAlwaysAllowed(pathname)) {
      setLockedFeature(null)
      return
    }

    const feature = findFeatureByPath(pathname)
    if (!feature) {
      setLockedFeature(null)
      return
    }

    let allowed = isFeatureIncludedInPlan(effective, feature.id)
    // Add-ons liberam IA / domínio no Profissional
    if (!allowed && feature.id === 'ai_whatsapp' && effective === 'profissional') {
      const addons = sub?.addons || []
      allowed = addons.some(
        (a) =>
          a.active &&
          (a.productId === 'ia-integracao' ||
            a.productId === 'ia-mensalidade-pro' ||
            a.productId.includes('ia'))
      )
    }
    if (!allowed && feature.id === 'custom_domain' && effective === 'profissional') {
      allowed = (sub?.addons || []).some((a) => a.active && a.productId === 'dominio')
    }

    setLockedFeature(allowed ? null : feature)
  }, [pathname])

  if (!lockedFeature) return <>{children}</>

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Recurso bloqueado no seu plano</h1>
        <p className="mt-2 text-sm text-muted-foreground">{lockedFeature.lockMessage}</p>

        <div className="mt-6 space-y-3">
          <p className="font-semibold text-foreground">{lockedFeature.name}</p>
          <p className="text-sm text-muted-foreground">{lockedFeature.description}</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {lockedFeature.benefits.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="default">Plano atual: {planNames[planId]}</Badge>
            <Badge variant="primary">
              Disponível a partir do {planNames[lockedFeature.minPlan]}
            </Badge>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href={`/plans?upgrade=${lockedFeature.minPlan}`}>
            <Button>{lockedFeature.upgradeCta}</Button>
          </Link>
          <Link href="/plans">
            <Button variant="outline">Ver todos os planos</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="tertiary">Voltar ao painel</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
