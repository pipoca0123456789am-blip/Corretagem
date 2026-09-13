'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { ClientAuthShell, useClientRealtor } from '@/components/client-portal/chrome'
import { getClientSession, loginClient } from '@/lib/client-auth'
import { demoClient } from '@/lib/phase11-data'

export default function ClientLoginPage() {
  const router = useRouter()
  const { slug, profile } = useClientRealtor()
  const [email, setEmail] = useState(demoClient.email)
  const [password, setPassword] = useState(demoClient.password)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!profile) return null
  const base = `/cliente/${slug}`

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await loginClient({
      email,
      password,
      realtorSlug: profile.slug,
      realtorId: profile.id,
      name: email === demoClient.email ? demoClient.name : undefined,
      phone: email === demoClient.email ? demoClient.phone : undefined,
    })
    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }
    if (remember) localStorage.setItem('clientRemember', 'true')
    const session = getClientSession()
    if (!session?.termsAccepted) router.push(`${base}/termos`)
    else if (!session?.onboardingComplete) router.push(`${base}/onboarding`)
    else router.push(base)
    setLoading(false)
  }

  return (
    <ClientAuthShell
      title="Entrar na área do cliente"
      subtitle={`Acesso exclusivo vinculado a ${profile.firstName}`}
    >
      {error ? <Alert className="mb-4" variant="destructive" description={error} /> : null}
      <form onSubmit={submit} className="space-y-4">
        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
        <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
        <Checkbox checked={remember} onCheckedChange={setRemember} label="Manter conectado neste dispositivo" />
        <Button type="submit" className="w-full" isLoading={loading}>
          Entrar
        </Button>
      </form>
      <div className="mt-4 space-y-2 text-center text-sm">
        <Link href={`${base}/recuperar-senha`} className="text-primary hover:underline">
          Esqueci minha senha
        </Link>
        <p className="text-muted-foreground">
          Ainda não tem conta?{' '}
          <Link href={`${base}/cadastro`} className="text-primary hover:underline">
            Criar cadastro
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">Demo: {demoClient.email} / {demoClient.password}</p>
      </div>
    </ClientAuthShell>
  )
}
