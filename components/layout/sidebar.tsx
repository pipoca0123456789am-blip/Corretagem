'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { MENU_FEATURE_MAP, isFeatureIncludedInPlan, type FeatureId } from '@/lib/plan-access'
import { getEffectivePlanId, getRealtorSubscription } from '@/lib/phase14-data'
import { LockedMenuItem, UpgradeLockModal } from '@/components/billing/feature-lock'

const menuSections = [
  {
    label: 'Início',
    items: [{ label: 'Painel', href: '/dashboard' }],
  },
  {
    label: 'Operação imobiliária',
    items: [
      { label: 'Imóveis', href: '/imoveis' },
      { label: 'Clientes', href: '/clientes' },
      { label: 'CRM', href: '/crm' },
      { label: 'Agenda', href: '/agenda' },
      { label: 'Visitas', href: '/visitas' },
      { label: 'Negociações', href: '/negociacoes' },
      { label: 'Documentos', href: '/documents' },
    ],
  },
  {
    label: 'Presença digital e marketing',
    items: [
      { label: 'Meu Site', href: '/meu-site' },
      { label: 'Minha página', href: '/minha-pagina' },
      { label: 'Campanhas', href: '/campanhas' },
    ],
  },
  {
    label: 'Gestão do negócio',
    items: [
      { label: 'Financeiro', href: '/financeiro' },
      { label: 'Relatórios', href: '/reports' },
      { label: 'Minha IA', href: '/minha-ia' },
      { label: 'Integrações', href: '/integrations' },
    ],
  },
  {
    label: 'Conta e relacionamento',
    items: [
      { label: 'Assinatura', href: '/assinatura' },
      { label: 'Equipe', href: '/team' },
      { label: 'Solicitações', href: '/solicitacoes' },
      { label: 'Notificações', href: '/notificacoes' },
      { label: 'Meu perfil', href: '/profile' },
      { label: 'Configurações', href: '/configuracoes' },
      { label: 'Suporte', href: '/suporte' },
    ],
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [planId, setPlanId] = useState(getEffectivePlanId())
  const [lockFeatureId, setLockFeatureId] = useState<FeatureId | null>(null)

  useEffect(() => {
    setPlanId(getEffectivePlanId(getRealtorSubscription()))
  }, [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-card p-2 transition-colors hover:bg-muted md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-sidebar-border p-6">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <img src="/icon.svg" alt="Logo" className="h-8 w-8 rounded" />
            <div>
              <span className="block text-lg font-bold leading-tight text-sidebar-foreground">ImóvelHub</span>
              <span className="text-[11px] text-sidebar-foreground/70">Painel do Corretor</span>
            </div>
          </Link>
        </div>

        <nav aria-label="Navegação principal" className="h-[calc(100vh-140px)] overflow-y-auto p-3">
          <div className="space-y-5">
            {menuSections.map((section) => (
              <section key={section.label} aria-label={section.label}>
                <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
                  {section.label}
                </h2>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const featureId = MENU_FEATURE_MAP[item.href]
                    const locked = featureId ? !isFeatureIncludedInPlan(planId, featureId) : false
                    const isActive =
                      pathname === item.href ||
                      (item.href.length > 1 && pathname.startsWith(`${item.href}/`)) ||
                      (item.href === '/imoveis' && pathname.startsWith('/properties')) ||
                      (item.href === '/clientes' && pathname.startsWith('/clients')) ||
                      (item.href === '/negociacoes' && pathname.startsWith('/negotiations')) ||
                      (item.href === '/financeiro' && pathname.startsWith('/financial')) ||
                      (item.href === '/minha-pagina' && pathname.startsWith('/professional')) ||
                      (item.href === '/minha-ia' && pathname.startsWith('/ai')) ||
                      (item.href === '/assinatura' && pathname.startsWith('/plans')) ||
                      (item.href === '/suporte' && pathname.startsWith('/help')) ||
                      (item.href === '/configuracoes' && pathname.startsWith('/settings')) ||
                      (item.href === '/visitas' && pathname.startsWith('/visits')) ||
                      (item.href === '/meu-site' && pathname.startsWith('/meu-site'))

                    return (
                      <li key={item.href}>
                        <LockedMenuItem
                          label={item.label}
                          href={item.href}
                          locked={locked}
                          active={isActive}
                          onNavigate={() => setIsOpen(false)}
                          onOpen={() => {
                            if (featureId) setLockFeatureId(featureId)
                            setIsOpen(false)
                          }}
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-sidebar-border p-3">
          <button
            type="button"
            className="w-full rounded-lg px-4 py-2 text-left text-sm text-sidebar-foreground hover:bg-sidebar-accent/20"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
              window.location.href = '/login'
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      {isOpen ? (
        <div className="fixed inset-0 z-[25] bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />
      ) : null}

      {lockFeatureId ? (
        <UpgradeLockModal
          open={!!lockFeatureId}
          onClose={() => setLockFeatureId(null)}
          featureId={lockFeatureId}
          currentPlanId={planId}
        />
      ) : null}
    </>
  )
}
