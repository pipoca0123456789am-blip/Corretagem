import { NextResponse } from 'next/server'
import { readSession } from '@/lib/server/session'
import { findUserById, toPublicUser, getUsersStoreBackend } from '@/lib/server/users'
import { isProductionRuntime } from '@/lib/server/secrets'

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

export async function GET() {
  const admin = await readSession('admin')
  if (admin) {
    const user = await findUserById(admin.sub!)
    if (user && user.status === 'ativo') {
      return NextResponse.json({
        ok: true,
        realm: 'admin',
        session: sessionPayload(admin),
        user: toPublicUser(user),
        ...(!isProductionRuntime() ? { storeBackend: getUsersStoreBackend() } : {}),
      })
    }
  }

  const app = await readSession('app')
  if (app) {
    const user = await findUserById(app.sub!)
    if (user && user.status === 'ativo') {
      return NextResponse.json({
        ok: true,
        realm: 'app',
        session: sessionPayload(app),
        user: toPublicUser(user),
        ...(!isProductionRuntime() ? { storeBackend: getUsersStoreBackend() } : {}),
      })
    }
  }

  const client = await readSession('client')
  if (client) {
    const user = await findUserById(client.sub!)
    if (user && user.status === 'ativo') {
      return NextResponse.json({
        ok: true,
        realm: 'client',
        session: sessionPayload(client),
        user: toPublicUser(user),
        ...(!isProductionRuntime() ? { storeBackend: getUsersStoreBackend() } : {}),
      })
    }
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
