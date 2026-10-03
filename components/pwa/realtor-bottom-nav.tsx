'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Building2,
  CalendarDays,
  Home,
  MoreHorizontal,
  Users,
} from 'lucide-react'
import { detectDevice } from '@/lib/pwa'

const primary = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/imoveis', label: 'Imóveis', icon: Building2 },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
]

const moreLinks = [
  { href: '/crm', label: 'CRM' },
  { href: '/negociacoes', label: 'Negociações' },
  { href: '/financeiro', label: 'Financeiro' },
  { href: '/meu-site', label: 'Meu Site' },
  { href: '/minha-ia', label: 'Minha IA' },
  { href: '/assinatura', label: 'Assinatura' },
  { href: '/suporte', label: 'Suporte' },
  { href: '/configuracoes/aplicativo', label: 'Aplicativo' },
  { href: '/configuracoes', label: 'Configurações' },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/imoveis') return pathname.startsWith('/imoveis') || pathname.startsWith('/properties')
  if (href === '/clientes') return pathname.startsWith('/clientes') || pathname.startsWith('/clients')
  if (href === '/crm') return pathname.startsWith('/crm')
  if (href === '/agenda') return pathname.startsWith('/agenda')
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function RealtorBottomNav() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const d = detectDevice()
    const narrow = window.matchMedia('(max-width: 767px)').matches
    setShow(d.isStandalone || narrow)
  }, [])

  if (!show) return null

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-16 mx-auto max-h-[70vh] max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-sm font-semibold text-foreground">Mais</p>
            <ul className="grid grid-cols-2 gap-2">
              {moreLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex min-h-11 items-center rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navegação do aplicativo"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1">
          {primary.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[11px] ${
                    active ? 'font-semibold text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`flex w-full min-h-12 flex-col items-center justify-center gap-0.5 px-1 text-[11px] ${
                moreOpen ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              <MoreHorizontal className="h-5 w-5" />
              Mais
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
