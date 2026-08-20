'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/meu-site', label: 'Visão Geral', exact: true },
  { href: '/meu-site/imoveis', label: 'Meus Imóveis' },
  { href: '/meu-site/personalizar', label: 'Personalização' },
  { href: '/meu-site/templates', label: 'Templates' },
  { href: '/meu-site/dominio', label: 'Meu Domínio' },
  { href: '/meu-site/metricas', label: 'Métricas' },
  { href: '/meu-site/configuracoes', label: 'Configurações' },
]

export function MeuSiteNav() {
  const pathname = usePathname()

  return (
    <nav className="-mx-1 overflow-x-auto pb-1">
      <ul className="flex min-w-max gap-1 px-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
