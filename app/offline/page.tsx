'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  const msg = useMemo(
    () =>
      'Você está sem conexão. Algumas informações podem estar indisponíveis. Verifique sua internet e tente novamente.',
    []
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Sem conexão</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">{msg}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Status: {online ? 'online' : 'offline'} · ações críticas não são confirmadas sem internet.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button className="min-h-11" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
        <Link href="/login">
          <Button variant="outline" className="min-h-11">
            Login do corretor
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="tertiary" className="min-h-11">
            Ir ao painel
          </Button>
        </Link>
      </div>
    </main>
  )
}
