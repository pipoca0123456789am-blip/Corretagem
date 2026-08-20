'use client'

import { useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { getClientMessages } from '@/lib/phase11-data'

export default function ClientMessagesPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [text, setText] = useState('')
  const [success, setSuccess] = useState('')
  if (!profile) return null
  const messages = getClientMessages(profile.firstName)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
        <p className="text-sm text-muted-foreground">
          Canal exclusivo com {profile.name} — sem envio real
        </p>
      </div>
      {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}
      <PageState state={state} onRetry={reload}>
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                msg.from === 'cliente'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p>{msg.text}</p>
              <p className={`mt-1 text-[10px] ${msg.from === 'cliente' ? 'opacity-80' : 'text-muted-foreground'}`}>
                {msg.at}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <Textarea
            label="Nova mensagem"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva para o seu corretor"
          />
          <Button
            onClick={() => {
              if (!text.trim()) return
              setText('')
              setSuccess('Mensagem registrada visualmente (simulado).')
            }}
          >
            Enviar
          </Button>
        </div>
      </PageState>
    </div>
  )
}
