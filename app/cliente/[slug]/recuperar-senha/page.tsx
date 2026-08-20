'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { ClientAuthShell, useClientRealtor } from '@/components/client-portal/chrome'

export default function ClientForgotPasswordPage() {
  const { slug, profile } = useClientRealtor()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!profile) return null
  const base = `/cliente/${slug}`

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Informe o e-mail cadastrado.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setSent(true)
      setLoading(false)
    }, 800)
  }

  return (
    <ClientAuthShell title="Recuperar senha" subtitle="Envio simulado — sem e-mail real">
      {error ? <Alert className="mb-4" variant="destructive" description={error} /> : null}
      {sent ? (
        <Alert
          className="mb-4"
          variant="success"
          title="Instruções enviadas"
          description={`Se ${email} estiver vinculado a ${profile.firstName}, você receberia o link de redefinição.`}
        />
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" className="w-full" isLoading={loading}>
            Enviar link
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm">
        <Link href={`${base}/login`} className="text-primary hover:underline">
          Voltar ao login
        </Link>
      </p>
    </ClientAuthShell>
  )
}
