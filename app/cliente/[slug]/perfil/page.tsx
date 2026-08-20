'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { getClientSession, loadJson, saveJson } from '@/lib/client-auth'
import { ClientProfile, defaultProfile } from '@/lib/phase11-data'

export default function ClientProfilePage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [form, setForm] = useState<ClientProfile>(defaultProfile())
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const session = getClientSession()
    setForm(
      loadJson(
        'profile',
        defaultProfile(session?.name || '', session?.email || '', session?.phone || '')
      )
    )
  }, [])

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perfil pessoal</h1>
        <p className="text-sm text-muted-foreground">Atualize seus dados para o atendimento de {profile.firstName}</p>
      </div>
      {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}
      <PageState state={state} onRetry={reload}>
        <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
          <Input label="Data de nascimento" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          <Input label="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Bairro" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
          <Button
            onClick={() => {
              saveJson('profile', form)
              setSuccess('Perfil atualizado com sucesso.')
            }}
          >
            Atualizar perfil
          </Button>
        </div>
      </PageState>
    </div>
  )
}
