'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { ClientAuthShell, useClientRealtor } from '@/components/client-portal/chrome'
import { loginClient } from '@/lib/client-auth'

export default function ClientSignupPage() {
  const router = useRouter()
  const { slug, profile } = useClientRealtor()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [accept, setAccept] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!profile) return null
  const base = `/cliente/${slug}`

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (!accept) {
      setError('É necessário aceitar o vínculo com este corretor.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      loginClient({
        email: form.email,
        password: form.password,
        realtorSlug: profile.slug,
        realtorId: profile.id,
        name: form.name,
        phone: form.phone,
      })
      setSuccess(true)
      setTimeout(() => router.push(`${base}/termos`), 900)
      setLoading(false)
    }, 800)
  }

  return (
    <ClientAuthShell
      title="Criar conta de cliente"
      subtitle={`Seu cadastro ficará vinculado a ${profile.name}`}
    >
      {error ? <Alert className="mb-4" variant="destructive" description={error} /> : null}
      {success ? (
        <Alert className="mb-4" variant="success" description="Cadastro criado. Vamos aos termos de uso." />
      ) : null}
      <form onSubmit={submit} className="space-y-4">
        <Input label="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input label="Confirmar senha" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        <Checkbox
          checked={accept}
          onCheckedChange={setAccept}
          label={`Autorizo meu atendimento exclusivo por ${profile.firstName}`}
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Cadastrar
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href={`${base}/login`} className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </ClientAuthShell>
  )
}
