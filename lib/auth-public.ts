/**
 * Helpers públicos seguros para UI (sem secrets / sem senhas).
 */

export function isDevSeedUiEnabled(): boolean {
  if (typeof process === 'undefined') return false
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_SEED === 'true') return true
  if (process.env.NODE_ENV === 'production') return false
  return process.env.NEXT_PUBLIC_ENABLE_DEV_SEED !== 'false'
}

/**
 * Espelho client-side da allowlist de `lib/server/safe-redirect`.
 * Servidor continua sendo a fonte da verdade nas APIs de login.
 */
const ALLOWED_PREFIXES = [
  '/dashboard',
  '/paineladmin',
  '/admin',
  '/onboarding',
  '/imoveis',
  '/properties',
  '/clientes',
  '/clients',
  '/crm',
  '/meu-site',
  '/plans',
  '/assinatura',
  '/help',
  '/suporte',
  '/settings',
  '/configuracoes',
  '/profile',
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
  '/team',
  '/documents',
  '/reports',
  '/solicitacoes',
  '/notificacoes',
  '/integrations',
  '/cliente/',
]

export function safeClientPath(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback
  const value = next.trim()
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//')) return fallback
  if (value.includes('://')) return fallback
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return fallback
  if (value.includes('\\') || value.includes('\0')) return fallback

  const pathOnly = value.split('?')[0]!.split('#')[0]!
  const ok = ALLOWED_PREFIXES.some(
    (p) => pathOnly === p || pathOnly.startsWith(p.endsWith('/') ? p : `${p}/`) || pathOnly.startsWith(p)
  )
  return ok ? value : fallback
}
