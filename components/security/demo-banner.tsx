'use client'

/**
 * Banner de demonstração — só aparece quando NEXT_PUBLIC_DEMO_MODE=true.
 * Removido do layout raiz; mantido para uso opcional em ambientes de demo.
 */
export function DemoSecurityBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null

  return (
    <div
      role="status"
      className="sticky top-0 z-[100] border-b border-amber-500/40 bg-amber-500 px-3 py-2 text-center text-xs font-medium text-amber-950 md:text-sm"
    >
      Ambiente de <strong>demonstração de UI</strong> — não use dados reais. Hardening de
      produção em andamento (sessões assinadas ativas; baseline completo ainda em progresso).
    </div>
  )
}
