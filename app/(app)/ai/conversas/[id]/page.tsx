'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  AiPageState,
  ConfirmModal,
  SuccessNote,
  useAiLoad,
} from '@/components/ai-agent/shared'
import {
  AiConversation,
  AiIntegration,
  getRealtorAi,
  upsertAi,
} from '@/lib/phase13-data'
import { aiConversationStatusLabels, labelPt } from '@/lib/labels-pt'

const messageFromLabels: Record<string, string> = {
  cliente: 'Cliente',
  ia: 'IA',
  corretor: 'Corretor',
  sistema: 'Sistema',
  humano: 'Humano',
}

export default function AiConversationDetailPage() {
  const params = useParams()
  const id = String(params.id)
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [conversation, setConversation] = useState<AiConversation | null>(null)
  const [reply, setReply] = useState('')
  const [success, setSuccess] = useState('')
  const [confirm, setConfirm] = useState<'take' | 'return' | null>(null)

  useEffect(() => {
    const current = getRealtorAi()
    setAi(current)
    const found = current?.conversations.find((c) => c.id === id) || null
    setConversation(found)
  }, [id, state])

  const persistConversation = (nextConv: AiConversation, note: string) => {
    if (!ai) return
    const conversations = ai.conversations.map((c) => (c.id === nextConv.id ? nextConv : c))
    upsertAi({
      ...ai,
      conversations,
      updatedAt: new Date().toISOString().slice(0, 10),
      history: [
        { id: `h-${Date.now()}`, label: note, at: new Date().toLocaleString('pt-BR') },
        ...ai.history,
      ],
    })
    setConversation(nextConv)
    setAi(getRealtorAi())
    setSuccess(note)
    setConfirm(null)
  }

  const takeOver = () => {
    if (!conversation) return
    persistConversation(
      {
        ...conversation,
        handledBy: 'humano',
        status: 'humano',
        messages: [
          ...conversation.messages,
          {
            id: `m-${Date.now()}`,
            from: 'sistema',
            text: 'Você assumiu o atendimento. A IA foi pausada nesta conversa.',
            at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      },
      'Atendimento assumido pelo corretor'
    )
  }

  const returnToAi = () => {
    if (!conversation) return
    persistConversation(
      {
        ...conversation,
        handledBy: 'ia',
        status: 'ia',
        messages: [
          ...conversation.messages,
          {
            id: `m-${Date.now()}`,
            from: 'sistema',
            text: 'Atendimento devolvido para a IA.',
            at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      },
      'Atendimento devolvido para a IA'
    )
  }

  const sendReply = () => {
    if (!conversation || !reply.trim()) return
    persistConversation(
      {
        ...conversation,
        handledBy: 'humano',
        status: 'humano',
        unread: false,
        messages: [
          ...conversation.messages,
          {
            id: `m-${Date.now()}`,
            from: 'corretor',
            text: reply,
            at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      },
      'Mensagem registrada (simulado)'
    )
    setReply('')
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'IA WhatsApp', href: '/ai' },
          { label: 'Conversas', href: '/ai/conversas' },
          { label: conversation?.contactName || id },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        <AiPageState
          state={state === 'ready' && !conversation ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Conversa não encontrada',
            description: 'Ela não pertence ao seu agente ou não existe.',
            action: { label: 'Voltar', onClick: () => (window.location.href = '/ai/conversas') },
          }}
        >
          {conversation ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{conversation.contactName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {conversation.contactPhone} · {conversation.intent}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="info">{conversation.handledBy === 'humano' ? 'Humano' : 'IA'}</Badge>
                    <Badge variant="default">{labelPt(aiConversationStatusLabels, conversation.status)}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setConfirm('take')}>
                    Assumir atendimento
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirm('return')}>
                    Devolver para IA
                  </Button>
                </div>
              </div>

              <Alert variant="info" title="Resumo da conversa" description={conversation.summary} />

              <div className="space-y-2 rounded-xl border border-border bg-card p-4">
                {conversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                      msg.from === 'cliente'
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : msg.from === 'sistema'
                          ? 'mx-auto bg-muted text-muted-foreground'
                          : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-[10px] opacity-80">
                      {labelPt(messageFromLabels, msg.from)} · {msg.at}
                      {msg.media ? ` · ${msg.media}` : ''}
                    </p>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <Textarea
                  label="Responder como corretor (simulado)"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={sendReply}>Enviar</Button>
                  <Link href="/ai/conversas">
                    <Button variant="outline">Voltar à lista</Button>
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </AiPageState>

        <ConfirmModal
          open={confirm === 'take'}
          title="Assumir atendimento?"
          description="A IA deixa de responder nesta conversa até você devolver."
          confirmLabel="Assumir"
          onClose={() => setConfirm(null)}
          onConfirm={takeOver}
        />
        <ConfirmModal
          open={confirm === 'return'}
          title="Devolver para a IA?"
          description="O agente voltará a conduzir esta conversa com as regras do seu perfil."
          confirmLabel="Devolver"
          onClose={() => setConfirm(null)}
          onConfirm={returnToAi}
        />
      </div>
    </div>
  )
}
