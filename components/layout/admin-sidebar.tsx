'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Shield } from 'lucide-react'

const sections: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Centro de controle',
    items: [{ label: 'Dashboard', href: '/paineladmin' }],
  },
  {
    title: 'Corretores e contas',
    items: [
      { label: 'Corretores', href: '/admin/corretores' },
      { label: 'Usuários', href: '/admin/usuarios' },
      { label: 'Assinaturas', href: '/admin/assinaturas' },
      { label: 'Área do cliente', href: '/admin/client-portal' },
    ],
  },
  {
    title: 'Produtos por corretor',
    items: [
      { label: 'Páginas profissionais', href: '/admin/paginas-profissionais' },
      { label: 'Templates', href: '/admin/templates' },
      { label: 'Domínios', href: '/admin/domains' },
      { label: 'Agentes de IA', href: '/admin/agentes-ia' },
      { label: 'Imóveis (global)', href: '/admin/imoveis' },
      { label: 'Solicitações', href: '/admin/solicitacoes' },
    ],
  },
  {
    title: 'Operação',
    items: [
      { label: 'Suporte', href: '/admin/suporte' },
      { label: 'Leads e acessos', href: '/admin/leads' },
      { label: 'Comunicação', href: '/admin/comunicacao' },
      { label: 'Financeiro', href: '/admin/financeiro' },
      { label: 'Relatórios', href: '/admin/relatorios' },
      { label: 'Auditoria', href: '/admin/auditoria' },
    ],
  },
  {
    title: 'Sistema',
    items: [{ label: 'Configurações', href: '/admin/configuracoes' }],
  },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-slate-900 p-2 text-white md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 border-r border-slate-800 bg-slate-950 text-slate-100 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-slate-800 p-5">
          <Link href="/paineladmin" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-sm font-bold leading-tight">Hub Admin</span>
              <span className="text-[10px] uppercase tracking-wider text-amber-400/90">Super Admin</span>
            </div>
          </Link>
        </div>

        <nav className="h-[calc(100vh-140px)] overflow-y-auto p-3">
          <div className="space-y-5">
            {sections.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'bg-amber-500/20 font-medium text-amber-300'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-800 p-3">
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/admin/login'
            }}
          >
            Sair do Super Admin
          </button>
        </div>
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-[25] bg-black/60 md:hidden" onClick={() => setIsOpen(false)} />
      ) : null}
    </>
  )
}
