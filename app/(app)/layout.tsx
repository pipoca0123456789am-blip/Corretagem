'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PlanRouteGuard } from '@/components/billing/plan-route-guard'
import { RealtorPwaProvider } from '@/components/pwa/realtor-pwa-provider'
import { canAccessRealtorRealm, ensureCleanDevSeed } from '@/lib/auth'
import { detectDevice } from '@/lib/pwa'

export default function RealtorAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [mobilePad, setMobilePad] = useState(false)

  useEffect(() => {
    ensureCleanDevSeed()
    if (!canAccessRealtorRealm()) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`)
      return
    }
    setReady(true)
    const d = detectDevice()
    const narrow = window.matchMedia('(max-width: 767px)').matches
    setMobilePad(d.isStandalone || narrow)
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Validando acesso do corretor…</p>
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
