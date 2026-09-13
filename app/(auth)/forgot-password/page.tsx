'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { ArrowLeft } from 'lucide-react'
import { isDevSeedUiEnabled } from '@/lib/auth-public'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [devPath, setDevPath] = useState<string | null>(null)
  const showSeed = isDevSeedUiEnabled()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setDevPath(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        message?: string
        devResetPath?: string
      }
      if (!res.ok) {
        setError(data.error || 'Não foi possível enviar.')
        return
      }
      setSent(true)
      if (showSeed && data.devResetPath) setDevPath(data.devResetPath)
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-center">
        <img src="/logo.png" alt="ImóvelHub" className="h-16 w-16 rounded-lg shadow-lg" />
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
        {!sent ? (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Recuperar Senha</h1>
            <p className="mb-8 text-center text-muted-foreground">
              Insira seu e-mail para receber instruções
            </p>

            {error ? (
              <Alert variant="destructive" title="Erro" description={error} className="mb-6" />
            ) : null}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o acesso
              </Link>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-foreground">Verifique seu e-mail</h1>
            <p className="text-muted-foreground">
              Se o e-mail estiver cadastrado, enviaremos instruções de recuperação.
            </p>
            {devPath ? (
              <div className="rounded-lg border border-info bg-info/10 p-3 text-left text-sm">
                <p className="mb-1 font-medium text-info">Desenvolvimento</p>
                <Link href={devPath} className="underline">
                  Abrir link de redefinição
                </Link>
              </div>
            ) : null}
            <Link href="/login" className="inline-block text-sm text-primary hover:underline">
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
