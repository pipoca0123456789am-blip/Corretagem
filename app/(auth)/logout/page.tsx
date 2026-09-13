'use client'

import { useEffect } from 'react'
import { logoutApp } from '@/lib/auth'

export default function LogoutPage() {
  useEffect(() => {
    void (async () => {
      await logoutApp()
      window.location.href = '/login'
    })()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Saindo…</p>
    </div>
  )
}
