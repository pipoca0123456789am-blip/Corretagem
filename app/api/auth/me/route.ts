import { NextResponse } from 'next/server'
import { readSession } from '@/lib/server/session'
import { findUserById, toPublicUser, getUsersStoreBackend } from '@/lib/server/users'
import { isProductionRuntime } from '@/lib/server/secrets'
import type { AuthRealm } from '@/lib/server/users'

function sessionPayload(session: {
  sub?: string
  email: string
  name: string
  role: string
  realtorId: number | null
}) {
  return {
    userId: session.sub,
    email: session.email,
    name: session.name,
    role: session.role,
    realtorId: session.realtorId,
  }
}

async function resolveRealm(realm: AuthRealm) {
  const session = await readSession(realm)
  if (!session) return null
  const user = await findUserById(session.sub!)
  if (!user || user.status !== 'ativo') return null
  return { session, user }
}

export async function GET(request: Request) {
  const prefer = new URL(request.url).searchParams.get('realm')
  const order: AuthRealm[] =
    prefer === 'admin' || prefer === 'app' || prefer === 'client'
      ? [prefer]
      : ['admin', 'app', 'client']

  for (const realm of order) {
    const hit = await resolveRealm(realm)
    if (!hit) continue
    return NextResponse.json({
      ok: true,
      realm,
      session: sessionPayload(hit.session),
      user: toPublicUser(hit.user),
      ...(!isProductionRuntime() ? { storeBackend: getUsersStoreBackend() } : {}),
    })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
