import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  collectProductionEnvIssues,
  assertProductionSecurityEnv,
} from '../../lib/server/env'
import { isDevSeedEnabled, assertDevSeedAllowed } from '../../lib/server/secrets'
import { isAdmin2faEnforcementEnabled } from '../../lib/server/totp'
import { sendEmail } from '../../lib/server/email'
import {
  listPropertiesForSession,
  getPropertyForSession,
  assertBrokerCannotAccessOtherTenant,
  serializeProperty,
} from '../../lib/server/repositories'
import { AuthError } from '../../lib/server/policies'
import { toPublicUser } from '../../lib/server/users'
import type { ServerUser } from '../../lib/server/user-types'
import type { SessionClaims } from '../../lib/server/session'
import { __resetStoreSingletonsForTests } from '../../lib/server/store'
import { __resetRedisClientForTests } from '../../lib/server/store/redis-store'
import { __resetSessionStoreForTests } from '../../lib/server/session-store'
import { createSessionToken, verifySessionToken } from '../../lib/server/session'
import { createMemoryKvStore } from '../../lib/server/store/memory-kv-store'
import { createMemoryRevocationStore } from '../../lib/server/store/memory-revocation-store'

beforeEach(() => {
  __resetStoreSingletonsForTests()
  __resetRedisClientForTests()
  __resetSessionStoreForTests()
  process.env.AUTH_SECRET = 'imovelhub-dev-auth-secret-change-me-32b'
  delete process.env.VERCEL_ENV
  delete process.env.DATABASE_URL
  delete process.env.IMOVELHUB_DATABASE_URL
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
  delete process.env.REDIS_URL
  delete process.env.ENABLE_DEV_SEED
  delete process.env.ENCRYPTION_KEY
  delete process.env.REQUIRE_ADMIN_2FA
  delete process.env.RESEND_API_KEY
  delete process.env.EMAIL_PROVIDER
  delete process.env.SKIP_PROD_ENV_ASSERT
})

afterEach(() => {
  __resetStoreSingletonsForTests()
  __resetRedisClientForTests()
  __resetSessionStoreForTests()
  delete process.env.VERCEL_ENV
})

describe('production fail-closed env', () => {
  it('detecta AUTH_SECRET fraco / DB / Redis / seed / ENCRYPTION_KEY', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.AUTH_SECRET = 'imovelhub-dev-auth-secret-change-me-32b'
    process.env.ENABLE_DEV_SEED = 'true'
    const issues = collectProductionEnvIssues()
    const codes = issues.map((i) => i.code)
    expect(codes).toContain('AUTH_SECRET_WEAK')
    expect(codes).toContain('DATABASE_URL_MISSING')
    expect(codes).toContain('REDIS_MISSING')
    expect(codes).toContain('DEV_SEED_ENABLED')
    expect(codes).toContain('ENCRYPTION_KEY_MISSING')
  })

  it('assertProductionSecurityEnv não lança em test/skip', () => {
    process.env.VERCEL_ENV = 'production'
    expect(() => assertProductionSecurityEnv()).not.toThrow()
  })

  it('passa com env completo em produção (simulado sem skip forçado via collect)', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.AUTH_SECRET = 'prod-grade-auth-secret-value-32chars-min!!'
    process.env.ENCRYPTION_KEY = 'prod-grade-encryption-key-32chars-min!!'
    process.env.IMOVELHUB_DATABASE_URL = 'postgresql://u:p@localhost:5432/ih'
    process.env.REDIS_URL = 'redis://localhost:6379'
    delete process.env.ENABLE_DEV_SEED
    const issues = collectProductionEnvIssues()
    expect(issues).toEqual([])
  })
})

describe('seed guard', () => {
  it('recusa seed em produção', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.ENABLE_DEV_SEED = 'true'
    expect(isDevSeedEnabled()).toBe(false)
    expect(() => assertDevSeedAllowed()).toThrow(/desabilitado/)
  })

  it('permite seed em test/dev quando não false', () => {
    delete process.env.VERCEL_ENV
    expect(isDevSeedEnabled()).toBe(true)
  })
})

describe('email fail-closed produção', () => {
  it('não finge envio sem provedor em produção', async () => {
    process.env.VERCEL_ENV = 'production'
    process.env.SKIP_PROD_ENV_ASSERT = 'true'
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_PROVIDER
    const result = await sendEmail({
      to: 'a@b.com',
      subject: 't',
      text: 'x',
      sensitiveHint: '123456',
    })
    expect(result.ok).toBe(false)
    expect(result.provider).toBe('none')
    delete process.env.SKIP_PROD_ENV_ASSERT
  })
})

describe('2FA enforcement', () => {
  it('isAdmin2faEnforcementEnabled default on em produção', () => {
    process.env.VERCEL_ENV = 'production'
    process.env.SKIP_PROD_ENV_ASSERT = 'true'
    expect(isAdmin2faEnforcementEnabled()).toBe(true)
    process.env.REQUIRE_ADMIN_2FA = 'false'
    expect(isAdmin2faEnforcementEnabled()).toBe(false)
    delete process.env.SKIP_PROD_ENV_ASSERT
  })
})

describe('IDOR Broker A vs B', () => {
  const brokerA = {
    sub: 'u-a',
    sid: 's-a',
    email: 'a@a.com',
    name: 'A',
    role: 'corretor',
    realm: 'app',
    realtorId: 1,
  } as SessionClaims

  const brokerB = {
    ...brokerA,
    sub: 'u-b',
    sid: 's-b',
    realtorId: 99,
  } as SessionClaims

  it('Broker A não vê imóveis do Broker B', () => {
    const items = listPropertiesForSession(brokerA)
    expect(items.every((p) => p.realtorId === 1)).toBe(true)
    expect(items.some((p) => p.id === 'p-9')).toBe(false)
    expect(assertBrokerCannotAccessOtherTenant(1, 99)).toBe('forbidden')
  })

  it('getProperty de outro tenant → 404', () => {
    expect(() => getPropertyForSession(brokerA, 'p-9')).toThrow(AuthError)
    try {
      getPropertyForSession(brokerA, 'p-9')
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError)
      expect((e as AuthError).status).toBe(404)
    }
    expect(() => getPropertyForSession(brokerB, 'p-1')).toThrow(AuthError)
  })
})

describe('serializers nunca vazam secrets', () => {
  it('toPublicUser omite passwordHash e totp secrets', () => {
    const user: ServerUser = {
      id: 'u1',
      name: 'N',
      email: 'n@n.com',
      passwordHash: 'SECRET_HASH',
      role: 'corretor',
      status: 'ativo',
      realtorId: 1,
      emailVerifiedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totpSecretEnc: 'ENC',
      totpEnabled: true,
      totpRecoveryHashes: ['abc'],
    }
    const pub = toPublicUser(user)
    expect(pub).not.toHaveProperty('passwordHash')
    expect(pub).not.toHaveProperty('totpSecretEnc')
    expect(pub).not.toHaveProperty('totpRecoveryHashes')
    expect(JSON.stringify(pub)).not.toContain('SECRET_HASH')
    expect(JSON.stringify(serializeProperty({
      id: 'p-1',
      title: 'X',
      realtorId: 1,
      city: 'SP',
      status: 'ativo',
    }))).not.toMatch(/password|secret|token/i)
  })
})

describe('multi-instance shared store mock', () => {
  it('memória de processo NÃO isola entre factories (por isso Redis é obrigatório em prod)', async () => {
    const a = createMemoryRevocationStore()
    const b = createMemoryRevocationStore()
    await a.revokeSid('u1', 'sid-1')
    // Mesmo Map de módulo — simula single-process; multi-instância exigiria Redis
    expect(await a.isRevoked({ userId: 'u1', sid: 'sid-1' })).toBe(true)
    expect(await b.isRevoked({ userId: 'u1', sid: 'sid-1' })).toBe(true)

    const shared = createMemoryKvStore()
    await shared.set('k', 'v', 60_000)
    expect(await shared.get('k')).toBe('v')
  })

  it('sessão JWT+sid persiste via create/verify no mesmo processo', async () => {
    const { token, sid } = await createSessionToken({
      userId: 'u-shared',
      email: 's@s.com',
      name: 'S',
      role: 'corretor',
      realm: 'app',
      realtorId: 1,
    })
    expect(sid).toBeTruthy()
    const claims = await verifySessionToken(token)
    expect(claims?.sub).toBe('u-shared')
    expect(claims?.realm).toBe('app')
  })
})

describe('client portal auth SoT', () => {
  it('documenta que isClientAuthenticated exige syncedAt (sem localStorage forge)', async () => {
    // Import dinâmico evita window; função exige storage
    const mod = await import('../../lib/client-auth')
    expect(typeof mod.isClientAuthenticated).toBe('function')
    expect(typeof mod.syncClientSessionFromServer).toBe('function')
    // Sem window → false
    expect(mod.isClientAuthenticated()).toBe(false)
  })
})
