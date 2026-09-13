'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'
import { cachePublicSession } from '@/lib/auth'

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Enrollment 2FA sem sessão completa (challengeId)
        if (pathname?.startsWith('/admin/security/2fa')) {
          const hasChallenge =
            typeof window !== 'undefined' &&
            (sessionStorage.getItem('ih_admin_2fa_challenge') ||
              new URLSearchParams(window.location.search).get('setup') === '1')
          if (hasChallenge) {
            setReady(true)
            return
          }
        }
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
        const data = await res.json()
        if (cancelled) return
        const adminRoles = ['super_admin', 'admin', 'suporte', 'financeiro']
        if (!res.ok || !data?.ok || data.realm !== 'admin' || !adminRoles.includes(data.session?.role)) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/paineladmin')}`)
          return
        }
        cachePublicSession({
          userId: data.session.userId,
          email: data.session.email,
          name: data.session.name,
          role: data.session.role,
          realtorId: data.session.realtorId ?? null,
          realm: 'admin',
        })
        setReady(true)
      } catch {
        if (!cancelled) router.replace('/admin/login')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <p className="text-sm">Validando sessão administrativa…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-slate-900/40">{children}</main>
      </div>
    </div>
  )
}
