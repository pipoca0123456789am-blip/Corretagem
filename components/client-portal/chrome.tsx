'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays,
  FileText,
  GitCompare,
  Heart,
  History,
  Home,
  Menu,
  MessageSquare,
  Settings2,
  Sparkles,
  User,
  UserRound,
  Wallet,
  X,
  Eye,
  Ban,
  Building2,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import {
  canAccessClientPortal,
  getClientSession,
  isAdminViewingClient,
  logoutClient,
} from '@/lib/client-auth'
import { resolveClientRealtor } from '@/lib/phase11-data'
import { PublicRealtorProfile } from '@/lib/phase9-data'

export function useClientRealtor() {
  const params = useParams()
  const slug = String(params.slug || '')
  const profile = useMemo(() => resolveClientRealtor(slug), [slug])
  return { slug, profile }
}

export function ClientAuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  const { profile } = useClientRealtor()
  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Corretor não encontrado" description="Verifique o link de acesso." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <img src={profile.photo} alt={profile.name} className="h-12 w-12 rounded-full object-cover" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Área do cliente</p>
            <p className="font-semibold text-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.creci}</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Você permanece vinculado exclusivamente a {profile.firstName}.
        </p>
      </div>
    </div>
  )
}

const menu = (base: string) => [
  { href: base, label: 'Painel', icon: LayoutDashboard },
  { href: `${base}/meu-corretor`, label: 'Meu Corretor', icon: UserRound },
  { href: `${base}/recomendados`, label: 'Recomendados', icon: Sparkles },
  { href: `${base}/novos`, label: 'Novos imóveis', icon: Building2 },
  { href: `${base}/favoritos`, label: 'Favoritos', icon: Heart },
  { href: `${base}/comparacao`, label: 'Comparação', icon: GitCompare },
  { href: `${base}/visualizados`, label: 'Visualizados', icon: Eye },
  { href: `${base}/descartados`, label: 'Descartados', icon: Ban },
  { href: `${base}/visitas`, label: 'Visitas', icon: CalendarDays },
  { href: `${base}/propostas`, label: 'Propostas', icon: Home },
  { href: `${base}/documentos`, label: 'Documentos', icon: FileText },
  { href: `${base}/mensagens`, label: 'Mensagens', icon: MessageSquare },
  { href: `${base}/historico`, label: 'Histórico', icon: History },
  { href: `${base}/perfil`, label: 'Perfil pessoal', icon: User },
  { href: `${base}/financeiro`, label: 'Perfil financeiro', icon: Wallet },
  { href: `${base}/preferencias`, label: 'Preferências', icon: Settings2 },
]

export function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { slug, profile } = useClientRealtor()
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [denied, setDenied] = useState(false)
  const [adminView, setAdminView] = useState(false)
  const [sessionName, setSessionName] = useState('')

  const base = `/cliente/${slug}`

  useEffect(() => {
    if (!profile) {
      setDenied(true)
      setReady(true)
      return
    }
    if (!canAccessClientPortal(slug)) {
      router.replace(`${base}/login`)
      return
    }
    const session = getClientSession()
    if (!isAdminViewingClient()) {
      if (session && !session.termsAccepted) {
        router.replace(`${base}/termos`)
        return
      }
      if (session && !session.onboardingComplete) {
        router.replace(`${base}/onboarding`)
        return
      }
    }
    setAdminView(isAdminViewingClient())
    setSessionName(session?.name || (isAdminViewingClient() ? 'Super Admin' : 'Cliente'))
    setReady(true)
  }, [profile, slug, base, router])

  if (!ready) {
    return (
      <div className="space-y-4 p-6 md:p-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!profile || denied) {
    return (
      <div className="p-8">
        <EmptyState title="Acesso indisponível" description="Corretor não encontrado." />
      </div>
    )
  }

  const items = menu(base)

  return (
    <div className="min-h-screen bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-border bg-card p-2 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-card transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-border p-4">
          <Link href={base} className="flex items-center gap-3">
            <img src={profile.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">Área do cliente</p>
              <p className="truncate text-xs text-muted-foreground">{profile.firstName}</p>
            </div>
          </Link>
        </div>
        <nav className="h-[calc(100vh-150px)] overflow-y-auto p-3">
          <ul className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (adminView) {
                router.push('/admin/client-portal')
                return
              }
              logoutClient()
              router.push(`${base}/login`)
            }}
          >
            {adminView ? 'Voltar ao admin' : 'Sair'}
          </Button>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      ) : null}

      <div className="md:ml-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pl-12 md:pl-0">
            <div>
              <p className="text-sm font-semibold text-foreground">Olá, {sessionName}</p>
              <p className="text-xs text-muted-foreground">
                Carteira exclusiva de {profile.name}
              </p>
            </div>
            <Badge variant="info">{profile.creci}</Badge>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {adminView ? (
            <Alert
              className="mb-4"
              variant="info"
              title="Modo Super Admin"
              description="Acesso global de inspeção. Os dados exibidos pertencem apenas a este corretor."
            />
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}

export function PageState({
  state,
  onRetry,
  children,
  emptyTitle,
  emptyDescription,
}: {
  state: 'loading' | 'ready' | 'error' | 'empty'
  onRetry?: () => void
  children: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (state === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }
  if (state === 'error') {
    return (
      <EmptyState
        title="Não foi possível carregar"
        description="Tente novamente em instantes."
        action={onRetry ? { label: 'Tentar de novo', onClick: onRetry } : undefined}
      />
    )
  }
  if (state === 'empty') {
    return (
      <EmptyState
        title={emptyTitle || 'Nada por aqui'}
        description={emptyDescription || 'Assim que houver novidades, elas aparecerão nesta área.'}
      />
    )
  }
  return <>{children}</>
}

export function useSimulatedLoad(delay = 500) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const reload = () => {
    setState('loading')
    setTimeout(() => setState(Math.random() < 0.02 ? 'error' : 'ready'), delay)
  }
  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { state, reload, setState }
}

export type { PublicRealtorProfile }
