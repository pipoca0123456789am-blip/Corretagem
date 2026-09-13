'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'

function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('As senhas não correspondem')
      return
    }
    if (!token) {
      setError('Link inválido. Solicite um novo.')
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
        setError(data.error || 'Não foi possível alterar a senha')
        return
      }
      setDone(true)
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Senha alterada</h1>
        <p className="mb-6 text-muted-foreground">Faça login com a nova senha.</p>
        <Link href="/login">
          <Button variant="primary" size="lg" className="w-full">
            Ir para o acesso
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
      <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Nova senha</h1>
      <p className="mb-8 text-center text-muted-foreground">Mínimo 10 caracteres</p>
      {error ? <Alert variant="destructive" title="Erro" description={error} className="mb-6" /> : null}
      {!token ? (
        <Alert
          variant="destructive"
          title="Link incompleto"
          description="Abra o link recebido por e-mail ou solicite um novo."
          className="mb-6"
        />
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          label="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || !token}
          required
        />
        <Input
          type="password"
          label="Confirmar senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading || !token}
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !token}>
          {loading ? 'Salvando…' : 'Alterar senha'}
        </Button>
        <Link href="/forgot-password" className="block text-center text-sm text-primary hover:underline">
          Solicitar novo link
        </Link>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-8 flex justify-center">
        <img src="/logo.png" alt="ImóvelHub" className="h-16 w-16 rounded-lg shadow-lg" />
      </div>
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
