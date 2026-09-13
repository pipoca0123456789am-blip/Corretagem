/**
 * Validação de ambiente — fail-closed em produção.
 * Usado em instrumentation + rotas auth + factories de store.
 */

import { hasRedisEnv } from '@/lib/server/store/redis-env'
import { resolveDatabaseUrl } from '@/lib/server/store/postgres-user-store'
import { resolveSupabaseServiceConfig } from '@/lib/server/store/supabase-user-store'

const WEAK_AUTH_SECRETS = new Set([
  'imovelhub-dev-auth-secret-change-me-32b',
  'troque-por-uma-string-longa-e-aleatoria-min-32',
  'change-me-change-me-change-me-change-me',
  'secret'.padEnd(32, 'x'),
  'password'.padEnd(32, '0'),
])

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

/** Build/export/test — não falhar o pipeline sem secrets de produto. */
export function isSecurityAssertSkipped(): boolean {
  if (process.env.SKIP_PROD_ENV_ASSERT === 'true') return true
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') return true
  const phase = process.env.NEXT_PHASE || ''
  if (phase.includes('phase-production-build') || phase.includes('phase-export')) return true
  // Build Next sem servir tráfego
  if (process.env.NEXT_RUNTIME === undefined && process.env.npm_lifecycle_event === 'build') {
    return true
  }
  return false
}

export function hasDatabaseEnv(): boolean {
  return Boolean(resolveDatabaseUrl() || resolveSupabaseServiceConfig())
}

export function hasEmailProviderEnv(): boolean {
  const provider = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase()
  if (provider === 'resend' || Boolean(process.env.RESEND_API_KEY?.trim())) {
    return Boolean(process.env.RESEND_API_KEY?.trim())
  }
  if (provider === 'smtp') {
    return Boolean(
      process.env.SMTP_HOST?.trim() &&
        process.env.SMTP_USER?.trim() &&
        process.env.SMTP_PASS?.trim()
    )
  }
  return false
}

export function getAuthSecretRaw(): string | null {
  const raw = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '').trim()
  return raw || null
}

export function isAuthSecretWeak(raw: string): boolean {
  if (raw.length < 32) return true
  if (WEAK_AUTH_SECRETS.has(raw)) return true
  if (/^(.)\1{31,}$/.test(raw)) return true
  const lower = raw.toLowerCase()
  if (lower.includes('change-me') || lower.includes('dev-auth-secret')) return true
  return false
}

export type EnvIssue = { code: string; message: string }

/** Coleta problemas de produção (não lança). */
export function collectProductionEnvIssues(): EnvIssue[] {
  if (!isProductionRuntime()) return []
  const issues: EnvIssue[] = []

  const secret = getAuthSecretRaw()
  if (!secret) {
    issues.push({ code: 'AUTH_SECRET_MISSING', message: 'AUTH_SECRET ausente (mín. 32 chars).' })
  } else if (isAuthSecretWeak(secret)) {
    issues.push({
      code: 'AUTH_SECRET_WEAK',
      message: 'AUTH_SECRET fraco ou default de desenvolvimento — rejeitado em produção.',
    })
  }

  if (!hasDatabaseEnv()) {
    issues.push({
      code: 'DATABASE_URL_MISSING',
      message:
        'IMOVELHUB_DATABASE_URL/DATABASE_URL ou SUPABASE_SERVICE_ROLE_KEY+URL obrigatório em produção.',
    })
  }

  if (!hasRedisEnv()) {
    issues.push({
      code: 'REDIS_MISSING',
      message:
        'UPSTASH_REDIS_REST_URL+TOKEN ou REDIS_URL obrigatório em produção (rate-limit + revogação).',
    })
  }

  if (process.env.ENABLE_DEV_SEED === 'true') {
    issues.push({
      code: 'DEV_SEED_ENABLED',
      message: 'ENABLE_DEV_SEED=true é proibido em produção.',
    })
  }

  const enc = (process.env.ENCRYPTION_KEY || '').trim()
  if (!enc || enc.length < 32 || isAuthSecretWeak(enc)) {
    issues.push({
      code: 'ENCRYPTION_KEY_MISSING',
      message:
        'ENCRYPTION_KEY (≥32, distinto de defaults) obrigatório em produção para cifrar TOTP.',
    })
  } else if (secret && enc === secret) {
    issues.push({
      code: 'ENCRYPTION_KEY_SAME_AS_AUTH',
      message: 'ENCRYPTION_KEY deve ser distinto de AUTH_SECRET.',
    })
  }

  return issues
}

export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.IMOVELHUB_DEMO_MODE === 'true' ||
    process.env.IMOVELHUB_DEMO_MODE === '1'
  )
}

/**
 * Fail-closed: lança se produção estiver mal configurada.
 * Skip em build/test e em DEMO_MODE (UI pública até infra completa).
 */
export function assertProductionSecurityEnv(): void {
  if (!isProductionRuntime() || isSecurityAssertSkipped() || isDemoMode()) return
  const issues = collectProductionEnvIssues()
  if (issues.length === 0) return
  const detail = issues.map((i) => `[${i.code}] ${i.message}`).join(' | ')
  throw new Error(`ImóvelHub fail-closed: ambiente de produção inválido — ${detail}`)
}

/** Chamado no início de rotas auth sensíveis. */
export function assertAuthInfrastructure(): void {
  assertProductionSecurityEnv()
}

/** Redis obrigatório em prod para rate-limit/revogação (exceto demo). */
export function assertRedisAvailableOrDev(): void {
  if (!isProductionRuntime() || isSecurityAssertSkipped() || isDemoMode()) return
  if (!hasRedisEnv()) {
    throw new Error(
      'ImóvelHub fail-closed: Redis/Upstash obrigatório em produção para rate-limit e revogação.'
    )
  }
}

/** Postgres/Supabase obrigatório em prod para user store (exceto demo). */
export function assertDatabaseAvailableOrDev(): void {
  if (!isProductionRuntime() || isSecurityAssertSkipped() || isDemoMode()) return
  if (!hasDatabaseEnv()) {
    throw new Error(
      'ImóvelHub fail-closed: DATABASE_URL ou SUPABASE_SERVICE_ROLE_KEY obrigatório em produção.'
    )
  }
}
