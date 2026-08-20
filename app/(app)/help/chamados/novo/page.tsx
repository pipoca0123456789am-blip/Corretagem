'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  SimulatedAttachments,
  SuccessNote,
} from '@/components/support/shared'
import { getUserName } from '@/lib/auth'
import {
  TicketCategory,
  TicketPriority,
  createTicket,
  getCurrentRealtorId,
  ticketCategoryLabels,
  priorityLabels,
} from '@/lib/phase16-data'

export default function NewTicketPage() {
  const router = useRouter()
  const [category, setCategory] = useState<TicketCategory>('outros')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('media')
  const [attachments, setAttachments] = useState<string[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!subject.trim() || !description.trim()) {
      setError('Preencha assunto e descrição.')
      return
    }
    const ticket = createTicket({
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      attachmentNames: attachments,
      realtorId: getCurrentRealtorId() || 1,
      realtorName: getUserName() || 'Corretor',
    })
    setSuccess('Chamado aberto com sucesso (simulado).')
    window.setTimeout(() => router.push(`/help/chamados/${ticket.id}`), 700)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Ajuda', href: '/help' },
          { label: 'Chamados', href: '/help/chamados' },
          { label: 'Novo' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abrir chamado</h1>
          <p className="text-sm text-muted-foreground">
            Sem envio real — o chamado fica na sua conta para acompanhamento.
          </p>
        </div>

        {success ? <SuccessNote message={success} /> : null}
        {error ? <Alert variant="destructive" description={error} /> : null}

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <Select
            label="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            options={Object.entries(ticketCategoryLabels).map(([value, label]) => ({ value, label }))}
          />
          <Input
            label="Assunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Resuma o problema"
            required
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva com detalhes o que aconteceu"
            required
            rows={5}
          />
          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TicketPriority)}
            options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Anexos</p>
            <SimulatedAttachments
              names={attachments}
              onAdd={(name) => setAttachments((prev) => [...prev, name])}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">Enviar chamado</Button>
            <Link href="/help/chamados">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
