'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'

export default function CommunicationPage() {
  const [sent, setSent] = useState(false)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/paineladmin' }, { label: 'Comunicação' }]} />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Comunicação</h1>
          <p className="text-sm text-muted-foreground">Avisos e anúncios simulados para corretores</p>
        </div>
        {sent ? (
          <Alert variant="success" description="Comunicado registrado visualmente. Sem envio real de e-mail/push." />
        ) : null}
        <form
          className="space-y-4 rounded-xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <Select
            label="Público"
            options={[
              { value: 'todos', label: 'Todos os corretores' },
              { value: 'profissional', label: 'Plano Profissional' },
              { value: 'premium', label: 'Plano Premium' },
            ]}
            defaultValue="todos"
          />
          <Input label="Assunto" placeholder="Manutenção programada" required />
          <Textarea label="Mensagem" rows={5} placeholder="Escreva o aviso..." required />
          <Button type="submit">Publicar aviso (simulado)</Button>
        </form>
      </div>
    </div>
  )
}
