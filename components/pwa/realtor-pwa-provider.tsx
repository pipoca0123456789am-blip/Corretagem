'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Alert } from '@/components/design-system/feedback/alert'
import { Button } from '@/components/design-system/buttons/button'
import { InstallPromptHost } from '@/components/pwa/install-prompt'
import { RealtorBottomNav } from '@/components/pwa/realtor-bottom-nav'
import {
  injectRealtorManifest,
  registerCorretorServiceWorker,
  getSwVersionHint,
} from '@/lib/pwa'
import { canAccessRealtorRealm } from '@/lib/auth'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function RealtorPwaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [forcePopup, setForcePopup] = useState(false)
  const [updateReady, setUpdateReady] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [offline, setOffline] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    setAllowed(canAccessRealtorRealm())
  }, [pathname])

  useEffect(() => {
    if (!allowed) return
    injectRealtorManifest()
    registerCorretorServiceWorker().then((reg) => {
      if (!reg) return
      if (reg.waiting) {
        setWaitingWorker(reg.waiting)
        setUpdateReady(true)
      }
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(installing)
            setUpdateReady(true)
          }
        })
      })
    })

    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)

    const onInstalled = () => setDeferred(null)
    window.addEventListener('appinstalled', onInstalled)

    const syncOnline = () => setOffline(!navigator.onLine)
    syncOnline()
    window.addEventListener('online', syncOnline)
    window.addEventListener('offline', syncOnline)

    const onForce = () => setForcePopup(true)
    window.addEventListener('imovelhub:show-install-popup', onForce)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip)
      window.removeEventListener('appinstalled', onInstalled)
      window.removeEventListener('online', syncOnline)
      window.removeEventListener('offline', syncOnline)
      window.removeEventListener('imovelhub:show-install-popup', onForce)
    }
  }, [allowed])

  const applyUpdate = useCallback(() => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setUpdateReady(false)
    window.location.reload()
  }, [waitingWorker])

  if (!allowed) return <>{children}</>

  return (
    <>
      {children}
      <RealtorBottomNav />
      <InstallPromptHost
        deferredPrompt={deferred}
        setDeferredPrompt={setDeferred}
        forceOpen={forcePopup}
        onForceOpenHandled={() => setForcePopup(false)}
      />

      {offline ? (
        <div className="fixed inset-x-0 top-0 z-[60] p-3 md:left-64">
          <Alert
            variant="warning"
            title="Sem conexão"
            description="Você está sem conexão. Algumas informações podem estar indisponíveis. Verifique sua internet e tente novamente. Alterações não serão confirmadas como salvas."
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}

      {updateReady ? (
        <div className="fixed inset-x-0 bottom-20 z-[55] px-3 md:bottom-4 md:left-64">
          <div className="mx-auto flex max-w-xl flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              Uma nova versão do ImóvelHub está disponível.
              <span className="ml-1 text-xs text-muted-foreground">({getSwVersionHint()})</span>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setUpdateReady(false)}>
                Depois
              </Button>
              <Button size="sm" onClick={applyUpdate}>
                Atualizar agora
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
