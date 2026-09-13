/* ImóvelHub Corretor — Service Worker (cache seguro, sem dados de outros usuários) */
const VERSION = 'imovelhub-corretor-v2'
const PRECACHE = [
  '/offline',
  '/manifest-corretor.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Nunca cachear painéis autenticados / APIs / rotas privadas
  const sensitivePrefixes = [
    '/admin',
    '/paineladmin',
    '/api',
    '/cliente',
    '/dashboard',
    '/properties',
    '/imoveis',
    '/clients',
    '/clientes',
    '/crm',
    '/agenda',
    '/visits',
    '/visitas',
    '/negotiations',
    '/negociacoes',
    '/financial',
    '/financeiro',
    '/professional',
    '/minha-pagina',
    '/ai',
    '/minha-ia',
    '/plans',
    '/assinatura',
    '/help',
    '/suporte',
    '/settings',
    '/configuracoes',
    '/profile',
    '/reports',
    '/documents',
    '/team',
    '/solicitacoes',
    '/notificacoes',
    '/integrations',
    '/campanhas',
    '/onboarding',
    '/meu-site',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ]

  const sensitive = sensitivePrefixes.some(
    (p) => url.pathname === p || url.pathname.startsWith(`${p}/`)
  )

  if (sensitive) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline'))
    )
    return
  }

  // Navegação: network first → offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          if (res.ok && url.pathname === '/offline') {
            caches.open(VERSION).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => caches.match('/offline').then((r) => r || caches.match(req)))
    )
    return
  }

  // Assets estáticos: stale-while-revalidate leve
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webmanifest')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(VERSION).then((c) => c.put(req, copy))
            }
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
  }
})
