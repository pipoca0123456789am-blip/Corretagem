'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Phase12State, StatusBadge, useUiLoad } from '@/components/professional/shared'
import {
  PROFESSIONAL_PAGE_PRICE,
  ProfessionalRequest,
  formatCurrency,
  getRealtorProfessionalRequest,
  updateRequestStatus,
  upsertProfessionalRequest,
  visualModels,
} from '@/lib/phase12-data'

export default function ProfessionalCheckoutPage() {
  const router = useRouter()
  const { state, reload } = useUiLoad()
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)
  const [method, setMethod] = useState('pix')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setRequest(getRealtorProfessionalRequest())
  }, [state])

  const pay = () => {
    if (!request) return
    setLoading(true)
    setTimeout(() => {
      const updated = updateRequestStatus(request.id, 'pagamento_confirmado', `Pagamento simulado via ${method}`)
      if (updated) {
        upsertProfessionalRequest({
          ...updated,
          paymentMethod: method === 'pix' ? 'Pix' : method === 'card' ? 'Cartão' : 'Boleto',
          paymentStatus: 'confirmado',
          status: 'em_producao',
          producer: 'Equipe Criativa ImóvelHub',
          timeline: [
            ...updated.timeline,
            {
              id: `t-prod-${Date.now()}`,
              status: 'em_producao',
              label: 'Produção iniciada',
              at: new Date().toLocaleString('pt-BR'),
            },
          ],
        })
      }
      setSuccess('Pagamento confirmado visualmente. Produção iniciada.')
      setLoading(false)
      setTimeout(() => router.push('/professional/confirmacao'), 800)
    }, 900)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Checkout' },
        ]}
      />
      <div className="mx-auto max-w-xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout visual</h1>
          <p className="text-sm text-muted-foreground">Sem cobrança real — simulação de pagamento</p>
        </div>
        {success ? <Alert variant="success" description={success} /> : null}
        <Phase12State
          state={!request && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Nenhuma solicitação para pagar',
            description: 'Preencha o formulário antes do checkout.',
            action: { label: 'Solicitar', onClick: () => router.push('/professional/solicitar') },
          }}
        >
          {request ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">Página Profissional</p>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Modelo: {visualModels.find((m) => m.id === request.form.modelId)?.name} · /corretor/
                {request.form.slug}
              </p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(PROFESSIONAL_PAGE_PRICE)}</p>
              <Select
                label="Forma de pagamento"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                options={[
                  { value: 'pix', label: 'Pix' },
                  { value: 'card', label: 'Cartão de crédito' },
                  { value: 'boleto', label: 'Boleto' },
                ]}
              />
              <Button className="w-full" isLoading={loading} onClick={pay}>
                Confirmar pagamento simulado
              </Button>
              <Link href="/professional/acompanhamento" className="block text-center text-sm text-primary">
                Voltar ao acompanhamento
              </Link>
            </div>
          ) : null}
        </Phase12State>
      </div>
    </div>
  )
}
