'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { Modal } from '@/components/design-system/feedback/modal'
import { InstallGuideContent } from '@/components/pwa/install-prompt'
import {
  detectDevice,
  getPwaEvents,
  getPwaPrefs,
  requestShowPopupAgain,
  resolveGuideKind,
  canUseNativeInstallPrompt,
  recordPwaEvent,
  getSwVersionHint,
} from '@/lib/pwa'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function AppSettingsPage() {
  const [device, setDevice] = useState(detectDevice())
  const [prefs, setPrefs] = useState(getPwaPrefs())
  const [events, setEvents] = useState(getPwaEvents())
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    setDevice(detectDevice())
    setPrefs(getPwaPrefs())
    setEvents(getPwaEvents())
    const onBip = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const guideKind = useMemo(() => resolveGuideKind(device), [device])
  const native = canUseNativeInstallPrompt(deferred, device)

  const install = async () => {
    if (native && deferred) {
      recordPwaEvent('install_started')
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === 'accepted') {
        recordPwaEvent('install_completed')
        setMsg('Instalação concluída.')
      } else {
        recordPwaEvent('install_declined')
        setMsg('Instalação recusada.')
      }
      setDeferred(null)
      return
    }
    recordPwaEvent('instructions_opened')
    setGuideOpen(true)
  }

  const showPopupAgain = () => {
    requestShowPopupAgain()
    setPrefs(getPwaPrefs())
    window.dispatchEvent(new Event('imovelhub:show-install-popup'))
    setMsg('O convite de instalação será exibido novamente.')
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Configurações', href: '/configuracoes' },
          { label: 'Aplicativo' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 pb-28 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Aplicativo ImóvelHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Instalação exclusiva para corretores e assistentes autorizados. Mesma conta e dados do painel web.
          </p>
        </div>

        {msg ? <Alert variant="success" description={msg} onClose={() => setMsg('')} /> : null}

        <section className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Status</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant={device.isStandalone ? 'success' : 'secondary'}>
              {device.isStandalone ? 'Instalado (standalone)' : 'Não instalado neste dispositivo'}
            </Badge>
            <Badge variant="info">{device.platformLabel}</Badge>
            <Badge variant="default">{device.browserLabel}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Versão cache: {getSwVersionHint()}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="min-h-11" onClick={install} disabled={device.isStandalone}>
              {native ? 'Instalar' : 'Ver como instalar'}
            </Button>
            <Button className="min-h-11" variant="outline" onClick={() => setGuideOpen(true)}>
              Instruções
            </Button>
            <Button className="min-h-11" variant="outline" onClick={showPopupAgain}>
              Exibir popup novamente
            </Button>
          </div>
          {prefs.neverShowPopup ? (
            <p className="text-xs text-muted-foreground">
              Preferência: não mostrar popup automaticamente neste dispositivo.
            </p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Benefícios</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Acesso rápido a dashboard, imóveis, CRM, agenda e Meu Site</li>
            <li>Abertura em janela própria (modo standalone)</li>
            <li>Mesmas permissões e isolamento por corretor</li>
            <li>Aviso de atualização quando houver nova versão</li>
          </ul>
        </section>

        <section className="space-y-2 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Resolução de problemas</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Instalação nativa exige HTTPS em produção (exceto localhost).</li>
            <li>No iPhone/iPad, use o Safari — outros navegadores não instalam PWA.</li>
            <li>Se o botão Instalar não aparecer, use o passo a passo do seu dispositivo.</li>
            <li>Após logout, a sessão é encerrada e o app volta ao login do corretor.</li>
            <li>O aplicativo nunca abre o Super Admin nem a área pública do visitante.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold text-foreground">Eventos neste dispositivo</h2>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {events.slice(0, 8).map((e, i) => (
                <li key={`${e.at}-${i}`} className="flex justify-between gap-2 border-b border-border pb-2">
                  <span className="text-foreground">{e.key}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString('pt-BR')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link href="/configuracoes" className="inline-block text-sm text-primary hover:underline">
          Voltar às configurações
        </Link>
      </div>

      <Modal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Passo a passo"
        description={`${device.platformLabel} · ${device.browserLabel}`}
        size="lg"
        footer={<Button onClick={() => setGuideOpen(false)}>Fechar</Button>}
      >
        <InstallGuideContent kind={guideKind} />
      </Modal>
    </div>
  )
}
