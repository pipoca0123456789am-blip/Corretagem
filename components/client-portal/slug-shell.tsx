'use client'

import { usePathname } from 'next/navigation'
import { ClientPortalLayout } from '@/components/client-portal/chrome'

const AUTH_SEGMENTS = new Set([
  'login',
  'cadastro',
  'recuperar-senha',
  'termos',
  'onboarding',
])

export function ClientSlugShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)
  // /cliente/[slug]/...
  const segment = parts[2] || ''

  // /cliente/[slug] = dashboard; demais rotas autenticadas usam o shell do portal
  if (!segment || !AUTH_SEGMENTS.has(segment)) {
    return <ClientPortalLayout>{children}</ClientPortalLayout>
  }

  return <>{children}</>
}
