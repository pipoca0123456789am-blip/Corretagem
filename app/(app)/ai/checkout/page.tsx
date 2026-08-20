'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { AiPageState, AiStatusBadge, useAiLoad } from '@/components/ai-agent/shared'
import {
  AI_INTEGRATION_PRICE,
  AI_PRICE_PROVISIONAL,
  AiIntegration,
  formatCurrency,
  getRealtorAi,
  upsertAi,
} from '@/lib/phase13-data'

export default function AiCheckoutPage() {
  const router = useRouter()
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [method, setMethod] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setAi(getRealtorAi())
  }, [state])

  const pay = () => {
    if (!ai) return
    setLoading(true)
    setTimeout(() => {
      upsertAi({
        ...ai,
        status: 'em_configuracao',
        paymentStatus: 'confirmado',
        paymentMethod: method === 'pix' ? 'Pix' : method === 'card' ? 'Cartão' : 'Boleto',
        updatedAt: new Date().toISOString().slice(0, 10),
        history: [
          {
            id: `h-${Date.now()}`,
            label: `Pagamento simulado confirmado — ${formatCurrency(AI_INTEGRATION_PRICE)}`,
            at: new Date().toLocaleString('pt-BR'),
          },
          ...ai.history,
        ],
      })
      setSuccess('Pagamento confirmado visualmente.')
      setLoading(false)
      setTimeout(() => router.push('/ai/configuracao'), 800)
    }, 800)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Checkout' }]} />
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout visual</h1>
          <p className="text-sm text-muted-foreground">Sem cobrança real</p>
        </div>
        {success ? <Alert variant="success" description={success} /> : null}
        <AiPageState
          state={!ai && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Nenhuma solicitação',
            description: 'Preencha o formulário antes do checkout.',
            action: { label: 'Solicitar', onClick: () => router.push('/ai/solicitar') },
          }}
        >
          {ai ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">IA + WhatsApp</p>
                <AiStatusBadge status={ai.status} />
              </div>
              <p className="text-3xl font-bold text-primary">{formatCurrency(AI_INTEGRATION_PRICE)}</p>
              {AI_PRICE_PROVISIONAL ? <Badge variant="info">Valor provisório</Badge> : null}
              <Select
                label="Forma de pagamento"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                options={[
                  { value: 'pix', label: 'Pix' },
                  { value: 'card', label: 'Cartão' },
                  { value: 'boleto', label: 'Boleto' },
                ]}
              />
              <Button className="w-full" isLoading={loading} onClick={pay}>
                Confirmar pagamento simulado
              </Button>
              <Link href="/ai" className="block text-center text-sm text-primary">
                Voltar
              </Link>
            </div>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}
