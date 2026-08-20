'use client'

import { LandingPage } from '@/components/marketing/landing-page'

/**
 * Página de vendas da plataforma.
 * Sempre pública — não redireciona mais quem tem sessão residual no navegador.
 * Painel: /dashboard | Admin: /admin/dashboard | Login: /login
 */
export default function Page() {
  return <LandingPage />
}
