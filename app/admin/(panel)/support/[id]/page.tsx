'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin, isSupportAgent, getUserName } from '@/lib/auth'
import {
  PriorityBadge,
  SimulatedAttachments,
  SlaBar,
  SuccessNote,
  SupportState,
  TicketStatusBadge,
  Timeline,
  useSupportLoad,
} from '@/components/support/shared'
import {
  SupportTicket,
  TicketPriority,
  TicketStatus,
  getTicketById,
  loadTickets,
  nowLabel,
  priorityLabels,
  supportAgents,
  ticketCategoryLabels,
  ticketStatusLabels,
  upsertTicket,
} from '@/lib/phase16-data'

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useSupportLoad()
  const [allowed, setAllowed] = useState(false)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [reply, setReply] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isSuperAdmin() && !isSupportAgent()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    const found = getTicketById(id) || loadTickets().find((t) => t.id === id) || null
    setTicket(found)
  }, [id, router, state])

  if (!allowed) return null

  const save = (next: SupportTicket, message: string) => {
    upsertTicket(next)
    setTicket(next)
    setSuccess(message)
  }

  const sendReply = () => {
    if (!ticket || !reply.trim()) return
    const next: SupportTicket = {
      ...ticket,
      status: ticket.status === 'novo' || ticket.status === 'reaberto' ? 'em_atendimento' : ticket.status,
      updatedAt: new Date().toISOString(),
      messages: [
        ...ticket.messages,
        {
          id: `m-${Date.now()}`,
          author: 'suporte',
          authorName: getUserName() || ticket.assigneeName || 'Suporte',
          body: reply.trim(),
          at: nowLabel(),
        },
      ],
      timeline: [
        {
          id: `t-${Date.now()}`,
          label: 'Resposta do suporte',
          at: nowLabel(),
          actor: getUserName() || 'Suporte',
        },
        ...ticket.timeline,
      ],
    }
    save(next, 'Resposta enviada (simulada).')
    setReply('')
  }

  const addInternal = () => {
    if (!ticket || !internalNote.trim()) return
    const next: SupportTicket = {
      ...ticket,
      internalNotes: [
        {
          id: `n-${Date.now()}`,
          body: internalNote.trim(),
          authorName: getUserName() || 'Equipe',
          at: nowLabel(),
        },
        ...ticket.internalNotes,
      ],
      updatedAt: new Date().toISOString(),
    }
    save(next, 'Observação interna salva (não visível ao corretor).')
    setInternalNote('')
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Suporte', href: '/admin/support' },
          { label: id },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}

        <SupportState
          state={state === 'ready' && !ticket ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Chamado não encontrado',
            action: { label: 'Voltar à fila', onClick: () => router.push('/admin/support') },
          }}
        >
          {ticket ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{ticket.subject}</h1>
                    <TicketStatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ticket.realtorName} · {ticketCategoryLabels[ticket.category]} · {ticket.id}
                  </p>
                </div>
                <Link href="/admin/support">
                  <Button variant="outline">Fila</Button>
                </Link>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <SlaBar ticket={ticket} />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="mb-3 font-semibold">Conversa</h2>
                    <div className="max-h-[360px] space-y-3 overflow-y-auto">
                      {ticket.messages.map((m) => (
                        <div key={m.id} className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground">
                            {m.authorName} · {m.at}
                          </p>
                          <p className="mt-1 text-sm">{m.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <Textarea
                        label="Responder ao corretor"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={sendReply} disabled={!reply.trim()}>
                        Enviar resposta
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-warning/40 bg-warning/5 p-4">
                    <h2 className="font-semibold text-foreground">Observações internas</h2>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Não aparecem para o corretor.
                    </p>
                    <ul className="mb-3 space-y-2">
                      {ticket.internalNotes.map((n) => (
                        <li key={n.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                          <p>{n.body}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {n.authorName} · {n.at}
                          </p>
                        </li>
                      ))}
                      {ticket.internalNotes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma observação ainda.</p>
                      ) : null}
                    </ul>
                    <Textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      rows={2}
                      placeholder="Nota interna..."
                    />
                    <Button className="mt-2" variant="outline" onClick={addInternal} disabled={!internalNote.trim()}>
                      Salvar observação
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <h2 className="font-semibold">Gestão</h2>
                    <Select
                      label="Status"
                      value={ticket.status}
                      onChange={(e) => {
                        const status = e.target.value as TicketStatus
                        save(
                          {
                            ...ticket,
                            status,
                            updatedAt: new Date().toISOString(),
                            timeline: [
                              {
                                id: `t-${Date.now()}`,
                                label: `Status: ${ticketStatusLabels[status]}`,
                                at: nowLabel(),
                                actor: getUserName() || 'Equipe',
                              },
                              ...ticket.timeline,
                            ],
                          },
                          'Status atualizado.'
                        )
                      }}
                      options={Object.entries(ticketStatusLabels).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                    <Select
                      label="Prioridade"
                      value={ticket.priority}
                      onChange={(e) => {
                        const priority = e.target.value as TicketPriority
                        save(
                          {
                            ...ticket,
                            priority,
                            updatedAt: new Date().toISOString(),
                            timeline: [
                              {
                                id: `t-${Date.now()}`,
                                label: `Prioridade: ${priorityLabels[priority]}`,
                                at: nowLabel(),
                                actor: getUserName() || 'Equipe',
                              },
                              ...ticket.timeline,
                            ],
                          },
                          'Prioridade atualizada.'
                        )
                      }}
                      options={Object.entries(priorityLabels).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                    />
                    <Select
                      label="Responsável"
                      value={ticket.assigneeId || ''}
                      onChange={(e) => {
                        const agent = supportAgents.find((a) => a.id === e.target.value)
                        save(
                          {
                            ...ticket,
                            assigneeId: agent?.id,
                            assigneeName: agent?.name,
                            status:
                              ticket.status === 'novo' ? 'em_analise' : ticket.status,
                            updatedAt: new Date().toISOString(),
                            timeline: [
                              {
                                id: `t-${Date.now()}`,
                                label: `Responsável: ${agent?.name || '—'}`,
                                at: nowLabel(),
                                actor: getUserName() || 'Equipe',
                              },
                              ...ticket.timeline,
                            ],
                          },
                          'Responsável atualizado.'
                        )
                      }}
                      options={[
                        { value: '', label: 'Selecionar' },
                        ...supportAgents.map((a) => ({ value: a.id, label: a.name })),
                      ]}
                    />
                    {ticket.rating ? (
                      <Alert
                        variant="success"
                        description={`Avaliação do corretor: ${ticket.rating}/5${ticket.ratingComment ? ` — ${ticket.ratingComment}` : ''}`}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem avaliação ainda.</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="mb-2 font-semibold">Anexos</h2>
                    <SimulatedAttachments names={ticket.attachmentNames} readOnly />
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="mb-3 font-semibold">Histórico / linha do tempo</h2>
                    <Timeline events={ticket.timeline} />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </SupportState>
      </div>
    </div>
  )
}
