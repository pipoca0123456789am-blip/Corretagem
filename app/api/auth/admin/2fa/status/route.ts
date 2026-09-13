import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/server/guards'
import { findUserById } from '@/lib/server/users'
import { isAdmin2faEnforcementEnabled } from '@/lib/server/totp'

/** Status do enrollment 2FA do admin autenticado. */
export async function GET() {
  try {
    const session = await requireAdmin()
    const user = await findUserById(session.sub!)
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Usuário não encontrado' }, { status: 404 })
    }
    return NextResponse.json({
      ok: true,
      totpEnabled: Boolean(user.totpEnabled),
      requireAdmin2fa: isAdmin2faEnforcementEnabled(),
      role: user.role,
      recoveryCodesRemaining: (user.totpRecoveryHashes || []).length,
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: e.status })
    }
    throw e
  }
}
