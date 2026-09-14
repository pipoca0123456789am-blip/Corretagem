import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import {
  getAuthSecret,
  SESSION_COOKIE_ADMIN,
  SESSION_COOKIE_APP,
  SESSION_COOKIE_CLIENT,
  SESSION_TTL_SECONDS,
  isProductionRuntime,
} from '@/lib/server/secrets'
import type { UserRole, AuthRealm } from '@/lib/server/users'
import { isSessionRevoked } from '@/lib/server/session-revocation'
import {
  createSessionRecord,
  validateSessionRecord,
  revokeSessionRecord,
  revokeAllSessionRecords,
  listSessionsForUser,
} from '@/lib/server/session-store'
import { resolveDatabaseUrl } from '@/lib/server/store/postgres-user-store'

export interface SessionClaims extends JWTPayload {
  sid: string
  sub: string
  email: string
  name: string
  role: UserRole
  realm: AuthRealm
  realtorId: number | null
}

function cookieName(realm: AuthRealm) {
  if (realm === 'admin') return SESSION_COOKIE_ADMIN
  if (realm === 'client') return SESSION_COOKIE_CLIENT
  return SESSION_COOKIE_APP
}

export async function createSessionToken(input: {
  userId: string
  email: string
  name: string
  role: UserRole
  realm: AuthRealm
  realtorId: number | null
  userAgent?: string | null
  ip?: string | null
}): Promise<{ token: string; sid: string; maxAge: number }> {
  const sid = crypto.randomUUID()
  const maxAge = SESSION_TTL_SECONDS
  const token = await new SignJWT({
    sid,
    email: input.email,
    name: input.name,
    role: input.role,
    realm: input.realm,
    realtorId: input.realtorId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .setJti(sid)
    .sign(getAuthSecret())

  // Persiste linha de sessão quando possível (Postgres ou memória)
  await createSessionRecord({
    sid,
    userId: input.userId,
    realm: input.realm,
    role: input.role,
    realtorId: input.realtorId,
    userAgent: input.userAgent,
    ip: input.ip,
    ttlSeconds: maxAge,
  })

  return { token, sid, maxAge }
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), { algorithms: ['HS256'] })
    const claims = payload as SessionClaims
    if (!claims.sub || !claims.role || !claims.realm || !claims.sid) return null
    if (
      await isSessionRevoked({
        userId: claims.sub,
        sid: claims.sid,
        iat: typeof claims.iat === 'number' ? claims.iat : undefined,
      })
    ) {
      return null
    }

    // Com DB wired: exige linha ativa (fail-closed multi-instância)
    if (resolveDatabaseUrl()) {
      const row = await validateSessionRecord(claims.sid)
      if (!row) return null
      if (row.userId !== claims.sub || row.realm !== claims.realm) return null
    }

    return claims
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    secure: isProductionRuntime(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

/**
 * Define cookie de sessão (Route Handlers / Server Actions).
 * Limpa cookies dos outros realms — cookies cruzados fazem /api/auth/me
 * priorizar admin e o layout do corretor redirecionar em loop para /login.
 */
export async function setSessionCookie(realm: AuthRealm, token: string, maxAge: number) {
  const jar = await cookies()
  const clearOpts = { ...sessionCookieOptions(0), maxAge: 0 }
  for (const other of ['admin', 'app', 'client'] as AuthRealm[]) {
    if (other !== realm) jar.set(cookieName(other), '', clearOpts)
  }
  jar.set(cookieName(realm), token, sessionCookieOptions(maxAge))
}

export async function clearSessionCookie(realm: AuthRealm) {
  const jar = await cookies()
  jar.set(cookieName(realm), '', { ...sessionCookieOptions(0), maxAge: 0 })
}

export async function readSession(realm: AuthRealm): Promise<SessionClaims | null> {
  const jar = await cookies()
  const raw = jar.get(cookieName(realm))?.value
  if (!raw) return null
  const claims = await verifySessionToken(raw)
  if (!claims || claims.realm !== realm) return null
  return claims
}

/** Para middleware (Edge): valida token bruto (JWT + secret; revoke hot-path no Node). */
export async function verifySessionTokenEdge(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null
  return verifySessionToken(token)
}

export async function rotateSession(input: {
  oldSid: string
  userId: string
  email: string
  name: string
  role: UserRole
  realm: AuthRealm
  realtorId: number | null
  userAgent?: string | null
  ip?: string | null
}): Promise<{ token: string; sid: string; maxAge: number }> {
  await revokeSessionRecord(input.oldSid, input.userId)
  return createSessionToken({
    userId: input.userId,
    email: input.email,
    name: input.name,
    role: input.role,
    realm: input.realm,
    realtorId: input.realtorId,
    userAgent: input.userAgent,
    ip: input.ip,
  })
}

export {
  revokeSessionRecord as revokeSession,
  revokeAllSessionRecords as revokeAllSessions,
  listSessionsForUser,
}

export { SESSION_COOKIE_ADMIN, SESSION_COOKIE_APP, SESSION_COOKIE_CLIENT }
