'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PlanRouteGuard } from '@/components/billing/plan-route-guard'
import { RealtorPwaProvider } from '@/components/pwa/realtor-pwa-provider'
import { detectDevice } from '@/lib/pwa'
import { cachePublicSession } from '@/lib/auth'
import { ensureFullPlanAccess } from '@/lib/phase14-data'

export default function RealtorAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [mobilePad, setMobilePad] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me?realm=app', { credentials: 'same-origin' })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !data?.ok || data.realm !== 'app' || !['corretor', 'assistente'].includes(data.session?.role)) {
          router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`)
          return
        }
        cachePublicSession({
          userId: data.session.userId,
          email: data.session.email,
          name: data.session.name,
          role: data.session.role,
          realtorId: data.session.realtorId ?? null,
          realm: 'app',
        })
        ensureFullPlanAccess(data.session.realtorId ?? 1)
        setReady(true)
        const d = detectDevice()
        const narrow = window.matchMedia('(max-width: 767px)').matches
        setMobilePad(d.isStandalone || narrow)
      } catch {
        if (!cancelled) router.replace('/login')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Validando sessão do corretor…</p>
      </div>
    )
  }

  return (
    <RealtorPwaProvider>
      <div className="flex min-h-screen overflow-x-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col md:ml-64">
          <Header />
          <main className={`min-w-0 flex-1 overflow-x-hidden overflow-y-auto ${mobilePad ? 'pb-24' : ''}`}>
            <PlanRouteGuard>{children}</PlanRouteGuard>
          </main>
        </div>
      </div>
    </RealtorPwaProvider>
  )
}
