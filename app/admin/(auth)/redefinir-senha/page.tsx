'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'

function AdminResetForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
      <h1 className="text-2xl font-bold text-white">Redefinir senha administrativa</h1>
      <p className="mt-2 text-sm text-slate-400">Token de uso único com expiração.</p>
      {error ? <Alert className="mt-4" variant="destructive" description={error} /> : null}
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setError('')
          if (password !== confirm) {
            setError('As senhas não correspondem')
            return
          }
          setLoading(true)
          try {
            const res = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'same-origin',
              body: JSON.stringify({ token, password }),
            })
            const data = (await res.json()) as { ok?: boolean; error?: string }
            if (!res.ok || !data.ok) {
              setError(data.error || 'Falha ao redefinir')
              return
            }
            window.location.href = '/admin/login'
          } catch {
            setError('Falha de rede')
          } finally {
            setLoading(false)
          }
        }}
      >
        <Input
          type="password"
          label="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Confirmar senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading || !token}>
          {loading ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
      </form>
      <Link href="/admin/login" className="mt-4 block text-center text-sm text-amber-400 hover:underline">
        Voltar ao login admin
      </Link>
    </div>
  )
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-slate-400">Carregando…</p>}>
      <AdminResetForm />
    </Suspense>
  )
}
