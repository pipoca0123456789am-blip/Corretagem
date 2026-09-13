'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { isDevSeedUiEnabled } from '@/lib/auth-public'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [devPath, setDevPath] = useState<string | null>(null)
  const showSeed = isDevSeedUiEnabled()

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
      <h1 className="text-2xl font-bold text-white">Recuperar acesso admin</h1>
      <p className="mt-2 text-sm text-slate-400">
        Mensagem genérica — não revelamos se o e-mail existe.
      </p>
      {message ? <Alert className="mt-4" variant="info" description={message} /> : null}
      {devPath ? (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          <p className="mb-1 font-medium">Dev</p>
          <Link href={devPath} className="underline">
            Abrir link de redefinição
          </Link>
        </div>
      ) : null}
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
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
              message?: string
              devResetPath?: string
              error?: string
            }
            setMessage(data.message || data.error || 'Solicitação processada.')
            if (showSeed && data.devResetPath) {
              setDevPath(
                data.devResetPath.replace('/reset-password', '/admin/redefinir-senha')
              )
            }
          } catch {
            setMessage('Falha de rede.')
          } finally {
            setLoading(false)
          }
        }}
      >
        <Input
          type="email"
          placeholder="admin@plataforma.com.br"
          label="E-mail administrativo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
      <Link href="/admin/login" className="mt-4 block text-center text-sm text-amber-400 hover:underline">
        Voltar ao login admin
      </Link>
    </div>
  )
}
