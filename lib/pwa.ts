/**
 * PWA exclusivo do corretor / assistente autorizado.
 * Preferências e telemetria local por dispositivo (localStorage).
 */

export type PwaInstallEventKey =
  | 'popup_shown'
  | 'install_started'
  | 'install_completed'
  | 'install_declined'
  | 'instructions_opened'

const PREF_KEY = 'imovelhub_pwa_prefs'
const EVENTS_KEY = 'imovelhub_pwa_events'
const SW_VERSION_HINT = 'imovelhub-corretor-v1'

export interface PwaPrefs {
  neverShowPopup: boolean
  snoozeUntil: number | null
  lastPopupAt: number | null
  forceShowOnce: boolean
}

export interface DeviceInfo {
  isStandalone: boolean
  isIOS: boolean
  isAndroid: boolean
  isMac: boolean
  isDesktop: boolean
  isSafari: boolean
  isChrome: boolean
  isEdge: boolean
  isIOSNonSafari: boolean
  platformLabel: string
  browserLabel: string
}

function defaultPrefs(): PwaPrefs {
  return {
    neverShowPopup: false,
    snoozeUntil: null,
    lastPopupAt: null,
    forceShowOnce: false,
  }
}

export function getPwaPrefs(): PwaPrefs {
  if (typeof window === 'undefined') return defaultPrefs()
  try {
    const raw = localStorage.getItem(PREF_KEY)
    return raw ? { ...defaultPrefs(), ...JSON.parse(raw) } : defaultPrefs()
  } catch {
    return defaultPrefs()
  }
}

export function savePwaPrefs(partial: Partial<PwaPrefs>) {
  if (typeof window === 'undefined') return
  const next = { ...getPwaPrefs(), ...partial }
  localStorage.setItem(PREF_KEY, JSON.stringify(next))
}

export function recordPwaEvent(key: PwaInstallEventKey, extra?: Record<string, string>) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    const list = raw ? JSON.parse(raw) : []
    list.unshift({ key, at: new Date().toISOString(), ...extra })
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(0, 40)))
  } catch {
    /* ignore */
  }
}

export function getPwaEvents(): { key: string; at: string }[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isStandalone: false,
      isIOS: false,
      isAndroid: false,
      isMac: false,
      isDesktop: true,
      isSafari: false,
      isChrome: false,
      isEdge: false,
      isIOSNonSafari: false,
      platformLabel: 'Desconhecido',
      browserLabel: 'Desconhecido',
    }
  }

  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/i.test(ua)
  const isMac = /Macintosh|Mac OS X/i.test(ua) && !isIOS
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari
    (typeof navigator !== 'undefined' && navigator.standalone === true)

  const isEdge = /Edg\//i.test(ua)
  const isChrome = /Chrome|CriOS/i.test(ua) && !isEdge && !/OPR\//i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR/i.test(ua)
  const isIOSNonSafari = isIOS && !isSafari
  const isDesktop = !isIOS && !isAndroid

  let platformLabel = 'Desktop'
  if (isIOS) platformLabel = /iPad/i.test(ua) ? 'iPad' : 'iPhone'
  else if (isAndroid) platformLabel = 'Android'
  else if (isMac) platformLabel = 'Mac'

  let browserLabel = 'Navegador'
  if (isEdge) browserLabel = 'Microsoft Edge'
  else if (isChrome) browserLabel = 'Google Chrome'
  else if (isSafari) browserLabel = 'Safari'
  else if (/Firefox/i.test(ua)) browserLabel = 'Firefox'

  return {
    isStandalone,
    isIOS,
    isAndroid,
    isMac,
    isDesktop,
    isSafari,
    isChrome,
    isEdge,
    isIOSNonSafari,
    platformLabel,
    browserLabel,
  }
}

/** Pode instalar via beforeinstallprompt (Chrome/Edge) */
export function canUseNativeInstallPrompt(
  deferred: Event | null,
  device: DeviceInfo
): boolean {
  return !!deferred && !device.isStandalone && (device.isChrome || device.isEdge || device.isAndroid)
}

/**
 * Popup só para corretor/assistente, no painel, uma vez / snooze.
 * Snooze padrão: 7 dias se fechar sem "não mostrar".
 */
export function shouldShowInstallPopup(opts: {
  isRealtorRole: boolean
  deferredPrompt: Event | null
  device: DeviceInfo
  importantModalOpen?: boolean
}): boolean {
  if (!opts.isRealtorRole) return false
  if (opts.importantModalOpen) return false
  if (opts.device.isStandalone) return false

  const prefs = getPwaPrefs()
  if (prefs.forceShowOnce) return true
  if (prefs.neverShowPopup) return false
  if (prefs.snoozeUntil && Date.now() < prefs.snoozeUntil) return false

  // iOS / Safari: mostrar instruções mesmo sem beforeinstallprompt
  if (opts.device.isIOS || opts.device.isSafari) return true

  // Chrome/Edge: só se puder instalar ou orientar ícone da barra
  if (opts.deferredPrompt) return true
  if (opts.device.isChrome || opts.device.isEdge) return true

  return false
}

export function snoozePopup(days = 7) {
  savePwaPrefs({
    snoozeUntil: Date.now() + days * 24 * 60 * 60 * 1000,
    lastPopupAt: Date.now(),
    forceShowOnce: false,
  })
}

export function dismissForever() {
  savePwaPrefs({
    neverShowPopup: true,
    forceShowOnce: false,
    lastPopupAt: Date.now(),
  })
  recordPwaEvent('install_declined')
}

export function requestShowPopupAgain() {
  savePwaPrefs({
    neverShowPopup: false,
    snoozeUntil: null,
    forceShowOnce: true,
  })
}

export function injectRealtorManifest() {
  if (typeof document === 'undefined') return
  const existing = document.querySelector('link[data-imovelhub-manifest="corretor"]')
  if (existing) return
  const link = document.createElement('link')
  link.rel = 'manifest'
  link.href = '/manifest-corretor.webmanifest'
  link.setAttribute('data-imovelhub-manifest', 'corretor')
  document.head.appendChild(link)

  let apple = document.querySelector('link[data-imovelhub-apple="1"]') as HTMLLinkElement | null
  if (!apple) {
    apple = document.createElement('link')
    apple.rel = 'apple-touch-icon'
    apple.href = '/icons/apple-touch-icon.png'
    apple.setAttribute('data-imovelhub-apple', '1')
    document.head.appendChild(apple)
  }

  let theme = document.querySelector('meta[data-imovelhub-theme="1"]') as HTMLMetaElement | null
  if (!theme) {
    theme = document.createElement('meta')
    theme.name = 'theme-color'
    theme.content = '#0f766e'
    theme.setAttribute('data-imovelhub-theme', '1')
    document.head.appendChild(theme)
  }

  let capable = document.querySelector('meta[data-imovelhub-capable="1"]') as HTMLMetaElement | null
  if (!capable) {
    capable = document.createElement('meta')
    capable.name = 'mobile-web-app-capable'
    capable.content = 'yes'
    capable.setAttribute('data-imovelhub-capable', '1')
    document.head.appendChild(capable)
  }
}

export async function registerCorretorServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw-corretor.js', { scope: '/' })
    return reg
  } catch {
    return null
  }
}

export function getSwVersionHint() {
  return SW_VERSION_HINT
}

export type GuideKind = 'chrome-desktop' | 'safari-mac' | 'android' | 'ios-safari' | 'ios-other' | 'generic'

export function resolveGuideKind(device: DeviceInfo): GuideKind {
  if (device.isIOS && device.isIOSNonSafari) return 'ios-other'
  if (device.isIOS) return 'ios-safari'
  if (device.isAndroid) return 'android'
  if (device.isMac && device.isSafari) return 'safari-mac'
  if (device.isChrome || device.isEdge) return 'chrome-desktop'
  return 'generic'
}
