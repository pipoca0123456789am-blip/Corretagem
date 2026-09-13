'use client'

import { useEffect, useState } from 'react'

/**
 * Banner permanente em produção: UI demo até baseline de segurança completa.
 */
export function DemoSecurityBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const host = window.location.hostname
    const isProdHost = host.includes('vercel.app') || host.includes('imovelhub')
    const force = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    setShow(force || isProdHost || process.env.NODE_ENV === 'production')
  }, [])

  if (!show) return null

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
