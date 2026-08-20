'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { Phase12State, useUiLoad } from '@/components/professional/shared'
import {
  ProfessionalRequest,
  getRealtorProfessionalRequest,
  updateRequestStatus,
  upsertProfessionalRequest,
} from '@/lib/phase12-data'

export default function ProfessionalAdjustmentsPage() {
  const router = useRouter()
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)
  const [text, setText] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  const submit = () => {
    if (!request) return
    if (!text.trim()) {
      setError('Descreva os ajustes desejados.')
      return
    }
    setError('')
    const updated = updateRequestStatus(request.id, 'ajustes_solicitados', text)
    if (updated) {
      upsertProfessionalRequest({
        ...updated,
        adjustments: [...updated.adjustments, text],
        messages: [
          ...updated.messages,
          {
            id: `msg-${Date.now()}`,
            from: 'corretor',
            text: `Pedido de ajuste: ${text}`,
            at: new Date().toLocaleString('pt-BR'),
          },
        ],
      })
    }
    setSuccess('Ajustes enviados à produção (simulado).')
    setTimeout(() => router.push('/professional/acompanhamento'), 800)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Ajustes' },
        ]}
      />
      <div className="mx-auto max-w-xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Solicitação de ajustes</h1>
          <p className="text-sm text-muted-foreground">Descreva o que deseja alterar na página</p>
        </div>
        {error ? <Alert variant="destructive" description={error} /> : null}
        {success ? <Alert variant="success" description={success} /> : null}
        <Phase12State
          state={!request && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Sem solicitação ativa', description: 'Não há pedido para ajustar.' }}
        >
          {request ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              {request.adjustments.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Ajustes anteriores</p>
                  {request.adjustments.map((item) => (
                    <p key={item} className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </p>
                  ))}
                </div>
              ) : null}
              <Textarea label="Novos ajustes" value={text} onChange={(e) => setText(e.target.value)} />
              <Button onClick={submit}>Enviar ajustes</Button>
            </div>
          ) : null}
        </Phase12State>
      </div>
    </div>
  )
}
