'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { canAccessAdminRealm, ensureCleanDevSeed } from '@/lib/auth'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AdminHeader } from '@/components/layout/admin-header'

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureCleanDevSeed()
    if (!canAccessAdminRealm()) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin/dashboard')}`)
      return
    }
    setReady(true)
  }, [router, pathname])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <p className="text-sm">Validando acesso administrativo…</p>
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
