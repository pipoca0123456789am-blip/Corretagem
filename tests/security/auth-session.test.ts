import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { SignJWT } from 'jose'
import { safeInternalPath } from '../../lib/server/safe-redirect'
import { assertPasswordPolicy } from '../../lib/server/password'
import { assertSameOrigin } from '../../lib/server/csrf'
import {
  createPasswordResetToken,
  consumePasswordResetToken,
} from '../../lib/server/password-reset'
import {
  revokeAllSessionsForUser,
  isSessionRevoked,
  revokeSession,
} from '../../lib/server/session-revocation'
import { roleHasPermission } from '../../lib/server/rbac'
import { verifySessionToken, createSessionToken } from '../../lib/server/session'
import { __resetRevocationStoreForTests } from '../../lib/server/store/memory-revocation-store'
import { __resetMemoryKvForTests } from '../../lib/server/store/memory-kv-store'
import { __resetStoreSingletonsForTests } from '../../lib/server/store'
import { __resetRedisClientForTests } from '../../lib/server/store/redis-store'
import { rateLimit } from '../../lib/server/rate-limit'
import { redactSensitive } from '../../lib/server/email'
import {
  encryptTotpSecret,
  decryptTotpSecret,
  verifyTotpCode,
  generateTotpSecret,
  buildTotp,
  hashRecoveryCode,
  consumeRecoveryCode,
} from '../../lib/server/totp'
import { resolveDatabaseUrl, createPostgresUserStore } from '../../lib/server/store/postgres-user-store'
import { createMemoryKvStore } from '../../lib/server/store/memory-kv-store'
import { hasRedisEnv } from '../../lib/server/store/redis-store'
import {
  listPropertiesForTenant,
  listClientsForTenant,
  listDocumentsForTenant,
  listLeadsForBroker,
} from '../../lib/server/domain-demo'

const secret = new TextEncoder().encode('imovelhub-dev-auth-secret-change-me-32b')

beforeEach(() => {
  __resetRevocationStoreForTests()
  __resetMemoryKvForTests()
  __resetStoreSingletonsForTests()
  __resetRedisClientForTests()
  process.env.AUTH_SECRET = 'imovelhub-dev-auth-secret-change-me-32b'
  delete process.env.DATABASE_URL
  delete process.env.SUPABASE_DB_URL
  delete process.env.IMOVELHUB_DATABASE_URL
  delete process.env.UPSTASH_REDIS_REST_URL
  delete process.env.UPSTASH_REDIS_REST_TOKEN
  delete process.env.REDIS_URL
})

afterEach(() => {
  __resetStoreSingletonsForTests()
  __resetRedisClientForTests()
})

describe('safeInternalPath', () => {
  it('bloqueia URLs externas', () => {
    expect(safeInternalPath('https://evil.com', '/paineladmin')).toBe('/paineladmin')
    expect(safeInternalPath('//evil.com', '/dashboard')).toBe('/dashboard')
    expect(safeInternalPath('javascript:alert(1)', '/dashboard')).toBe('/dashboard')
  })

  it('aceita paths internos', () => {
    expect(safeInternalPath('/dashboard', '/x')).toBe('/dashboard')
    expect(safeInternalPath('/paineladmin', '/x')).toBe('/paineladmin')
    expect(safeInternalPath('/admin/leads', '/x')).toBe('/admin/leads')
    expect(safeInternalPath('/cliente/corretor-demonstracao', '/x')).toBe(
      '/cliente/corretor-demonstracao'
    )
  })

  it('rejeita paths fora da allowlist e open-redirect encoded', () => {
    expect(safeInternalPath('/evil', '/dashboard')).toBe('/dashboard')
    expect(safeInternalPath('/\\evil.com', '/dashboard')).toBe('/dashboard')
    expect(safeInternalPath('/%0d%0aLocation:https://evil.com', '/dashboard')).toBe('/dashboard')
  })
})

describe('password policy', () => {
  it('rejeita senhas curtas e comuns', () => {
    expect(assertPasswordPolicy('123456').ok).toBe(false)
    expect(assertPasswordPolicy('password').ok).toBe(false)
    expect(assertPasswordPolicy('senha12345').ok).toBe(true)
  })
})

describe('verifySessionToken — forgery / admin cookie', () => {
  it('rejeita payload adulterado (assinatura inválida)', async () => {
    const token = await new SignJWT({
      sid: 's1',
      email: 'a@a.com',
      name: 'A',
      role: 'corretor',
      realm: 'app',
      realtorId: 1,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u1')
      .setExpirationTime('1h')
      .sign(secret)

    const parts = token.split('.')
    const forged = `${parts[0]}.${Buffer.from(
      JSON.stringify({
        role: 'super_admin',
        realm: 'admin',
        sid: 'x',
        sub: 'hack',
        email: 'x@x.com',
        name: 'H',
        realtorId: null,
      })
    ).toString('base64url')}.${parts[2]}`

    expect(await verifySessionToken(forged)).toBeNull()
  })

  it('rejeita cookie assinado com secret errado (forjado como admin)', async () => {
    const evil = new TextEncoder().encode('totally-different-secret-key-32chars!!')
    const forged = await new SignJWT({
      sid: 'evil',
      email: 'attacker@evil.com',
      name: 'Attacker',
      role: 'super_admin',
      realm: 'admin',
      realtorId: null,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('u-hack')
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(evil)

    expect(await verifySessionToken(forged)).toBeNull()
  })

  it('aceita token válido e rejeita após revogação de sid', async () => {
    const { token, sid } = await createSessionToken({
      userId: 'u-admin-1',
      email: 'admin@plataforma.com.br',
      name: 'Admin',
      role: 'super_admin',
      realm: 'admin',
      realtorId: null,
    })
    expect(await verifySessionToken(token)).not.toBeNull()
    await revokeSession('u-admin-1', sid)
    expect(await verifySessionToken(token)).toBeNull()
  })
})

describe('CSRF assertSameOrigin', () => {
  it('bloqueia Origin diferente do Host', () => {
    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        host: 'localhost:3001',
        origin: 'https://evil.com',
      },
    })
    expect(assertSameOrigin(req).ok).toBe(false)
  })

  it('aceita same-origin', () => {
    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        host: 'localhost:3001',
        origin: 'http://localhost:3001',
      },
    })
    expect(assertSameOrigin(req).ok).toBe(true)
  })

  it('bloqueia sec-fetch-site cross-site', () => {
    const req = new Request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        host: 'localhost:3001',
        'sec-fetch-site': 'cross-site',
      },
    })
    expect(assertSameOrigin(req).ok).toBe(false)
  })
})

describe('password reset tokens', () => {
  it('é single-use', () => {
    const { token } = createPasswordResetToken('u1', 'a@a.com')
    const first = consumePasswordResetToken(token)
    expect(first.ok).toBe(true)
    const second = consumePasswordResetToken(token)
    expect(second.ok).toBe(false)
  })

  it('rejeita token inventado', () => {
    expect(consumePasswordResetToken('deadbeef'.repeat(8)).ok).toBe(false)
  })
})

describe('session revocation', () => {
  it('revoga sessões anteriores por iat', async () => {
    const before = Math.floor(Date.now() / 1000) - 10
    await revokeAllSessionsForUser('u-rev')
    expect(await isSessionRevoked({ userId: 'u-rev', sid: 'any', iat: before })).toBe(true)
    expect(
      await isSessionRevoked({
        userId: 'u-rev',
        sid: 'any',
        iat: Math.floor(Date.now() / 1000) + 5,
      })
    ).toBe(false)
  })
})

describe('RBAC helpers', () => {
  it('mapeia permissões por role', () => {
    expect(roleHasPermission('super_admin', 'admin:write')).toBe(true)
    expect(roleHasPermission('assistente', 'broker:team')).toBe(false)
    expect(roleHasPermission('corretor', 'broker:write')).toBe(true)
    expect(roleHasPermission('cliente', 'broker:read')).toBe(false)
  })
})

describe('tenant filter domain demo (IDOR baseline)', () => {
  it('não vaza imóveis/clientes/docs de outro realtorId', () => {
    const props = listPropertiesForTenant(1)
    expect(props.every((p) => p.realtorId === 1)).toBe(true)
    expect(props.some((p) => p.id === 'p-9')).toBe(false)

    expect(listClientsForTenant(1).every((c) => c.realtorId === 1)).toBe(true)
    expect(listDocumentsForTenant(1).every((d) => d.realtorId === 1)).toBe(true)
    expect(listLeadsForBroker(1).every((l) => l.realtorId === 1)).toBe(true)
  })
})

describe('rate-limit SharedKvStore', () => {
  it('bloqueia após exceder limite (memória)', async () => {
    __resetStoreSingletonsForTests()
    const key = `test-rl-${Date.now()}`
    expect((await rateLimit(key, 2, 60_000)).ok).toBe(true)
    expect((await rateLimit(key, 2, 60_000)).ok).toBe(true)
    const third = await rateLimit(key, 2, 60_000)
    expect(third.ok).toBe(false)
  })

  it('createRedisKvStore só com env Redis (senão hasRedisEnv false)', () => {
    expect(hasRedisEnv()).toBe(false)
    const mem = createMemoryKvStore()
    expect(mem.backend).toBe('memory')
  })
})

describe('email redaction', () => {
  it('não ecoa OTP/token completo', () => {
    expect(redactSensitive('123456')).toBe('12…56 (6 chars)')
    expect(redactSensitive('a'.repeat(64))).toMatch(/^aa…aa \(64 chars\)$/)
    expect(redactSensitive('ab')).toBe('****')
    expect(redactSensitive(null)).toBe('[empty]')
  })
})

describe('TOTP', () => {
  it('verifica código com secret conhecido', () => {
    const secretBase32 = generateTotpSecret()
    const totp = buildTotp(secretBase32, 'admin@test.com')
    const code = totp.generate()
    expect(verifyTotpCode(secretBase32, code, 'admin@test.com')).toBe(true)
    expect(verifyTotpCode(secretBase32, '000000', 'admin@test.com')).toBe(false)
  })

  it('cifra/decifra secret', () => {
    const plain = generateTotpSecret()
    const enc = encryptTotpSecret(plain)
    expect(enc).not.toContain(plain)
    expect(decryptTotpSecret(enc)).toBe(plain)
  })

  it('consome recovery code hashed uma vez', async () => {
    const code = 'AABBCCDDEE'
    const hashes = [hashRecoveryCode(code), hashRecoveryCode('OTHEROTHER')]
    const first = await consumeRecoveryCode(code, hashes)
    expect(first.ok).toBe(true)
    if (first.ok) {
      expect(first.remaining).toHaveLength(1)
      const second = await consumeRecoveryCode(code, first.remaining)
      expect(second.ok).toBe(false)
    }
  })
})

describe('postgres adapter gate', () => {
  it('resolveDatabaseUrl ausente sem env', () => {
    expect(resolveDatabaseUrl()).toBeUndefined()
  })

  it('createPostgresUserStore exportado mas skip sem pool real', () => {
    // Sem DATABASE_URL não criamos pool — factory não deve ser chamada
    expect(typeof createPostgresUserStore).toBe('function')
    expect(resolveDatabaseUrl()).toBeUndefined()
  })
})
