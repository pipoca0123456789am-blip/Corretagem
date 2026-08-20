'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  ConfirmDialog,
  PriorityBadge,
  SimulatedAttachments,
  SuccessNote,
  SupportState,
  TicketStatusBadge,
  Timeline,
  useSupportLoad,
} from '@/components/support/shared'
import { getUserName } from '@/lib/auth'
import {
  SupportTicket,
  getTicketById,
  nowLabel,
  ticketCategoryLabels,
  upsertTicket,
} from '@/lib/phase16-data'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useSupportLoad()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [reply, setReply] = useState('')
  const [rating, setRating] = useState('5')
  const [ratingComment, setRatingComment] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmReopen, setConfirmReopen] = useState(false)

  useEffect(() => {
    const found = getTicketById(id)
    setTicket(found || null)
    if (found?.rating) setRating(String(found.rating))
    if (found?.ratingComment) setRatingComment(found.ratingComment)
  }, [id, state])

  const refresh = () => setTicket(getTicketById(id) || null)

  const sendReply = () => {
    if (!ticket || !reply.trim()) return
    const next: SupportTicket = {
      ...ticket,
      status: ticket.status === 'aguardando_corretor' ? 'em_atendimento' : ticket.status,
      updatedAt: new Date().toISOString(),
      messages: [
        ...ticket.messages,
        {
          id: `m-${Date.now()}`,
          author: 'corretor',
          authorName: getUserName() || ticket.realtorName,
          body: reply.trim(),
          at: nowLabel(),
        },
      ],
      timeline: [
        { id: `t-${Date.now()}`, label: 'Mensagem do corretor', at: nowLabel(), actor: getUserName() || ticket.realtorName },
        ...ticket.timeline,
      ],
    }
    upsertTicket(next)
    setReply('')
    setSuccess('Mensagem enviada (simulada).')
    refresh()
  }

  const submitRating = () => {
    if (!ticket) return
    const next = {
      ...ticket,
      rating: Number(rating),
      ratingComment: ratingComment.trim() || undefined,
      updatedAt: new Date().toISOString(),
      timeline: [
        { id: `t-${Date.now()}`, label: `Avaliação: ${rating}/5`, at: nowLabel(), actor: ticket.realtorName },
        ...ticket.timeline,
      ],
    }
    upsertTicket(next)
    setSuccess('Avaliação registrada.')
    refresh()
  }

  const reopen = () => {
    if (!ticket) return
    const next: SupportTicket = {
      ...ticket,
      status: 'reaberto',
      updatedAt: new Date().toISOString(),
      timeline: [
        { id: `t-${Date.now()}`, label: 'Chamado reaberto', at: nowLabel(), actor: ticket.realtorName },
        ...ticket.timeline,
      ],
      messages: [
        ...ticket.messages,
        {
          id: `m-${Date.now()}`,
          author: 'sistema',
          authorName: 'Sistema',
          body: 'Chamado reaberto pelo corretor.',
          at: nowLabel(),
        },
      ],
    }
    upsertTicket(next)
    setConfirmReopen(false)
    setSuccess('Chamado reaberto.')
    refresh()
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Ajuda', href: '/help' },
          { label: 'Chamados', href: '/help/chamados' },
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
            description: 'Ele não existe ou não pertence à sua conta.',
            action: { label: 'Voltar', onClick: () => router.push('/help/chamados') },
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
                    {ticket.id} · {ticketCategoryLabels[ticket.category]}
                    {ticket.assigneeName ? ` · ${ticket.assigneeName}` : ''}
                  </p>
                </div>
                <Link href="/help/chamados">
                  <Button variant="outline">Voltar</Button>
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="mb-3 font-semibold text-foreground">Conversa</h2>
                    <div className="max-h-[420px] space-y-3 overflow-y-auto">
                      {ticket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-lg border p-3 ${
                            m.author === 'corretor'
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-border bg-muted/30'
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">
                            {m.authorName} · {m.at}
                          </p>
                          <p className="mt-1 text-sm text-foreground">{m.body}</p>
                          {m.attachmentNames?.length ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Anexos: {m.attachmentNames.join(', ')}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {!['encerrado'].includes(ticket.status) ? (
                      <div className="mt-4 space-y-2">
                        <Textarea
                          label="Responder"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          rows={3}
                          placeholder="Escreva sua mensagem"
                        />
                        <Button onClick={sendReply} disabled={!reply.trim()}>
                          Enviar
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="mb-2 font-semibold">Anexos</h2>
                    <SimulatedAttachments names={ticket.attachmentNames} readOnly />
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h2 className="mb-3 font-semibold">Linha do tempo</h2>
                    <Timeline events={ticket.timeline} />
                  </div>
                  {['resolvido', 'encerrado'].includes(ticket.status) ? (
                    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                      <h2 className="font-semibold">Avaliação do atendimento</h2>
                      {ticket.rating ? (
                        <Alert
                          variant="success"
                          description={`Você avaliou com ${ticket.rating}/5${ticket.ratingComment ? ` — ${ticket.ratingComment}` : ''}`}
                        />
                      ) : (
                        <>
                          <Select
                            label="Nota"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            options={[1, 2, 3, 4, 5].map((n) => ({
                              value: String(n),
                              label: `${n} estrela${n > 1 ? 's' : ''}`,
                            }))}
                          />
                          <Textarea
                            label="Comentário (opcional)"
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                            rows={2}
                          />
                          <Button onClick={submitRating}>Enviar avaliação</Button>
                        </>
                      )}
                      <Button variant="outline" onClick={() => setConfirmReopen(true)}>
                        Reabrir chamado
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SupportState>

        <ConfirmDialog
          open={confirmReopen}
          title="Reabrir chamado?"
          description="O status voltará para reaberto e a equipe poderá continuar o atendimento."
          confirmLabel="Reabrir"
          onClose={() => setConfirmReopen(false)}
          onConfirm={reopen}
        />
      </div>
    </div>
  )
}
