'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Modal } from '@/components/design-system/feedback/modal'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  DeviceInfo,
  GuideKind,
  canUseNativeInstallPrompt,
  detectDevice,
  dismissForever,
  getPwaPrefs,
  recordPwaEvent,
  resolveGuideKind,
  savePwaPrefs,
  shouldShowInstallPopup,
  snoozePopup,
} from '@/lib/pwa'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallGuideContent({ kind }: { kind: GuideKind }) {
  if (kind === 'ios-other') {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <Alert
          variant="warning"
          title="Abra no Safari"
          description="Para instalar no iPhone, abra esta página no Safari e siga as instruções."
        />
        <p>No iPhone e no iPad, a instalação deve ser feita pelo Safari.</p>
      </div>
    )
  }

  if (kind === 'ios-safari') {
    return (
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Abra o link da plataforma no Safari.</li>
        <li>Entre na conta do corretor.</li>
        <li>Toque no botão de compartilhar.</li>
        <li>Role as opções.</li>
        <li>Toque em “Adicionar à Tela de Início”.</li>
        <li>Confirme o nome “ImóvelHub”.</li>
        <li>Toque em “Adicionar”.</li>
        <li>O ícone aparecerá na tela inicial.</li>
        <li>Abra o aplicativo pelo novo ícone.</li>
        <li>Utilize a mesma conta do painel do corretor.</li>
      </ol>
    )
  }

  if (kind === 'android') {
    return (
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Abra o link da plataforma no Google Chrome.</li>
        <li>Entre na conta do corretor.</li>
        <li>Aguarde o convite de instalação ou abra o menu do navegador.</li>
        <li>Toque em “Instalar aplicativo” ou “Adicionar à tela inicial”.</li>
        <li>Confirme a instalação.</li>
        <li>Aguarde a criação do ícone.</li>
        <li>Abra o ImóvelHub pela tela inicial do celular.</li>
        <li>Utilize normalmente com a mesma conta do corretor.</li>
      </ol>
    )
  }

  if (kind === 'safari-mac') {
    return (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Caso a instalação como aplicativo esteja disponível no Safari:</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Abra a plataforma no Safari.</li>
          <li>Entre na conta do corretor.</li>
          <li>Abra o menu de compartilhamento ou Arquivo, conforme a versão.</li>
          <li>Escolha adicionar ao Dock ou instalar como aplicativo.</li>
          <li>Confirme o nome.</li>
          <li>Abra pelo Dock ou pela pasta de aplicativos.</li>
        </ol>
        <p className="text-xs">
          Se a opção não aparecer na sua versão do Safari, use Chrome ou Edge no Mac para instalação nativa.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Google Chrome ou Microsoft Edge</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Entre na sua conta de corretor.</li>
        <li>Abra o menu do perfil.</li>
        <li>Clique em “Instalar aplicativo”.</li>
        <li>Clique no botão “Instalar”.</li>
        <li>Confirme a instalação no aviso do navegador.</li>
        <li>O ImóvelHub será aberto em uma janela própria.</li>
        <li>Um atalho poderá aparecer na área de trabalho ou no menu de aplicativos.</li>
        <li>Utilize o mesmo e-mail e senha do painel do corretor.</li>
      </ol>
      <Alert
        variant="info"
        description="Você também pode clicar no ícone de instalação localizado ao lado da barra de endereço."
      />
    </div>
  )
}

export function InstallPromptHost({
  deferredPrompt,
  setDeferredPrompt,
  forceOpen,
  onForceOpenHandled,
}: {
  deferredPrompt: BeforeInstallPromptEvent | null
  setDeferredPrompt: (e: BeforeInstallPromptEvent | null) => void
  forceOpen?: boolean
  onForceOpenHandled?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [neverAgain, setNeverAgain] = useState(false)
  const [device, setDevice] = useState<DeviceInfo | null>(null)
  const [busy, setBusy] = useState(false)

  const guideKind = useMemo(
    () => (device ? resolveGuideKind(device) : 'generic'),
    [device]
  )

  useEffect(() => {
    const d = detectDevice()
    setDevice(d)
    const prefs = getPwaPrefs()
    const show =
      forceOpen ||
      shouldShowInstallPopup({
        isRealtorRole: true,
        deferredPrompt,
        device: d,
      })

    if (!show) return

    // Atraso leve após login no painel — não bloquear
    const t = window.setTimeout(() => {
      setOpen(true)
      recordPwaEvent('popup_shown')
      savePwaPrefs({ lastPopupAt: Date.now(), forceShowOnce: false })
      onForceOpenHandled?.()
    }, forceOpen ? 200 : 1800)
    return () => window.clearTimeout(t)
  }, [deferredPrompt, forceOpen, onForceOpenHandled])

  const closeSoft = () => {
    setOpen(false)
    if (neverAgain) {
      dismissForever()
    } else {
      snoozePopup(7)
      recordPwaEvent('install_declined')
    }
  }

  const install = async () => {
    if (!device) return
    if (canUseNativeInstallPrompt(deferredPrompt, device) && deferredPrompt) {
      setBusy(true)
      recordPwaEvent('install_started')
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          recordPwaEvent('install_completed')
          setOpen(false)
          savePwaPrefs({ neverShowPopup: true, forceShowOnce: false })
        } else {
          recordPwaEvent('install_declined')
        }
        setDeferredPrompt(null)
      } finally {
        setBusy(false)
      }
      return
    }
    // Sem prompt nativo → instruções
    recordPwaEvent('instructions_opened')
    setGuideOpen(true)
  }

  const openGuide = () => {
    recordPwaEvent('instructions_opened')
    setGuideOpen(true)
  }

  if (!device) return null

  const nativeOk = canUseNativeInstallPrompt(deferredPrompt, device)

  return (
    <>
      <Modal
        isOpen={open}
        onClose={closeSoft}
        title="Leve o ImóvelHub com você"
        description="Instale o aplicativo exclusivo para corretores e acesse seus imóveis, clientes, leads e agenda com mais rapidez no computador ou celular."
        size="md"
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="tertiary" onClick={closeSoft} className="min-h-11">
              Agora não
            </Button>
            <Button variant="outline" onClick={openGuide} className="min-h-11">
              Ver passo a passo
            </Button>
            <Button onClick={install} disabled={busy} className="min-h-11">
              {nativeOk ? 'Instalar aplicativo' : device.isAndroid ? 'Adicionar à tela inicial' : 'Instalar aplicativo'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Disponível apenas para corretores e assistentes autorizados. O app abre direto no painel do corretor.
          </p>
          <Checkbox
            checked={neverAgain}
            onCheckedChange={(v) => setNeverAgain(!!v)}
            label="Não mostrar novamente neste dispositivo."
          />
        </div>
      </Modal>

      <Modal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Como instalar"
        description={`${device.platformLabel} · ${device.browserLabel}`}
        size="lg"
        footer={
          <Button onClick={() => setGuideOpen(false)} className="min-h-11">
            Entendi
          </Button>
        }
      >
        <InstallGuideContent kind={guideKind} />
      </Modal>
    </>
  )
}
