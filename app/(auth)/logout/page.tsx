'use client'

import { useEffect } from 'react'
import { logoutApp } from '@/lib/auth'

export default function LogoutPage() {
  useEffect(() => {
    logoutApp()
    window.location.href = '/login'
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Saindo</h1>
        <p className="text-muted-foreground">Encerrando sessão do corretor…</p>
      </div>
    </div>
  )
}
