import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/server/guards'

export function jsonAuthError(err: unknown) {
  if (err instanceof AuthError) {
    return NextResponse.json({ ok: false, error: err.message }, { status: err.status })
  }
  console.error('[api]', err)
  return NextResponse.json({ ok: false, error: 'Erro interno' }, { status: 500 })
}
