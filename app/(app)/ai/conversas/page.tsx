'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { AiPageState, useAiLoad } from '@/components/ai-agent/shared'
import { AiConversation, AiIntegration, getRealtorAi } from '@/lib/phase13-data'

export default function AiConversationsPage() {
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setAi(getRealtorAi())
  }, [state])

  const list = useMemo(() => {
    const items = ai?.conversations || []
    return items.filter((c) => {
      const matchStatus = status === 'all' || c.status === status || c.handledBy === status
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        c.contactName.toLowerCase().includes(q) ||
        c.intent.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [ai, status, search])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Conversas' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversas</h1>
          <p className="text-sm text-muted-foreground">
            Somente conversas do seu agente — sem mensagens reais
          </p>
        </div>
        <Alert
          variant="info"
          description="Filtros e inbox são simulados. Dados de outros corretores nunca aparecem aqui."
        />
        <AiPageState
          state={!ai && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'IA não contratada',
            description: 'Contrate o agente para visualizar conversas.',
            action: { label: 'Contratar', onClick: () => (window.location.href = '/ai/solicitar') },
          }}
        >
          {ai ? (
            <>
              <div className="grid gap-3 md:grid-cols-[1fr_200px]">
                <Input
                  placeholder="Buscar contato, intenção ou resumo"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'all', label: 'Todos' },
                    { value: 'ia', label: 'Com a IA' },
                    { value: 'humano', label: 'Com humano' },
                    { value: 'aguardando', label: 'Aguardando' },
                    { value: 'encerrada', label: 'Encerrada' },
                  ]}
                />
              </div>
              {list.length === 0 ? (
                <AiPageState
                  state="empty"
                  empty={{ title: 'Nenhuma conversa', description: 'Ajuste os filtros ou aguarde novos leads.' }}
                >
                  {null}
                </AiPageState>
              ) : (
                <div className="space-y-3">
                  {list.map((c) => (
                    <ConversationRow key={c.id} conversation={c} />
                  ))}
                </div>
              )}
            </>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}

function ConversationRow({ conversation }: { conversation: AiConversation }) {
  return (
    <Link
      href={`/ai/conversas/${conversation.id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:border-primary"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{conversation.contactName}</p>
            {conversation.unread ? <Badge variant="warning">Nova</Badge> : null}
            <Badge variant={conversation.handledBy === 'humano' ? 'secondary' : 'info'}>
              {conversation.handledBy === 'humano' ? 'Humano' : 'IA'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{conversation.intent}</p>
          <p className="mt-1 text-sm text-foreground line-clamp-2">{conversation.summary}</p>
        </div>
        <p className="text-xs text-muted-foreground">{conversation.updatedAt}</p>
      </div>
    </Link>
  )
}
