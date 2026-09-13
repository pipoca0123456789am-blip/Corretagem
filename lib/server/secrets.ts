/**
 * Secrets e flags de ambiente (somente servidor).
 * Nunca importar este módulo em Client Components.
 */

import {
  getAuthSecretRaw,
  isAuthSecretWeak,
  isDemoMode,
  isProductionRuntime,
  isSecurityAssertSkipped,
} from '@/lib/server/env'

export { isProductionRuntime } from '@/lib/server/env'

export function getAuthSecret(): Uint8Array {
  const raw = getAuthSecretRaw()
  if (!raw || isAuthSecretWeak(raw)) {
    if (isProductionRuntime() && !isSecurityAssertSkipped() && !isDemoMode()) {
      throw new Error(
        'AUTH_SECRET ausente, curto (<32) ou fraco/default — rejeitado em produção.'
      )
    }
    // Dev/demo fallback — NÃO usar em produção real
    return new TextEncoder().encode('imovelhub-dev-auth-secret-change-me-32b')
  }
  return new TextEncoder().encode(raw)
}

/**
 * Chave para cifrar TOTP at-rest — distinta de AUTH_SECRET.
 * Em prod: ENCRYPTION_KEY obrigatório (validado em env.ts).
 */
export function getEncryptionKeyMaterial(): Uint8Array {
  const enc = (process.env.ENCRYPTION_KEY || '').trim()
  if (enc.length >= 32 && !isAuthSecretWeak(enc)) {
    const auth = getAuthSecretRaw()
    if (auth && enc === auth && isProductionRuntime() && !isSecurityAssertSkipped() && !isDemoMode()) {
      throw new Error('ENCRYPTION_KEY não pode ser igual a AUTH_SECRET em produção.')
    }
    return new TextEncoder().encode(enc)
  }
  if (isProductionRuntime() && !isSecurityAssertSkipped() && !isDemoMode()) {
    throw new Error('ENCRYPTION_KEY ausente ou fraco em produção (mín. 32 chars).')
  }
  // Dev/demo: deriva de AUTH_SECRET com prefixo distinto (não é o mesmo material bruto)
  const auth = getAuthSecret()
  const mixed = new Uint8Array(auth.length + 16)
  mixed.set(new TextEncoder().encode('ih-enc-dev-v1::::'))
  mixed.set(auth, 16)
  return mixed
}

/**
 * Seeds: hard-refuse em produção (mesmo se ENABLE_DEV_SEED=true).
 * Dev: ativo salvo ENABLE_DEV_SEED=false.
 */
export function isDevSeedEnabled(): boolean {
  if (isProductionRuntime()) {
    if (process.env.ENABLE_DEV_SEED === 'true') {
      console.error(
        '[security] ENABLE_DEV_SEED=true ignorado e recusado em produção (fail-closed).'
      )
    }
    return false
  }
  return process.env.ENABLE_DEV_SEED !== 'false'
}

/** Guarda seed — lança se alguém tentar seed em prod. */
export function assertDevSeedAllowed(): void {
  if (!isDevSeedEnabled()) {
    throw new Error('Seed de desenvolvimento desabilitado (ENABLE_DEV_SEED / produção).')
  }
}

export const SESSION_COOKIE_ADMIN = 'ih_admin_sid'
export const SESSION_COOKIE_APP = 'ih_app_sid'
export const SESSION_COOKIE_CLIENT = 'ih_client_sid'
export const SESSION_TTL_SECONDS = 60 * 60 * 12 // 12h
