'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { SuccessNote } from '@/components/support/shared'
import { getUserName } from '@/lib/auth'
import {
  RequestType,
  createServiceRequest,
  formatCurrency,
  getCurrentRealtorId,
  requestTypeLabels,
} from '@/lib/phase16-data'

const suggestedAmounts: Partial<Record<RequestType, number>> = {
  pagina_profissional: 497,
  ia: 97,
  dominio: 149,
  alteracao_plano: 299,
  usuario_adicional: 79,
  servico_personalizado: 350,
}

export default function NewRequestPage() {
  const router = useRouter()
  const [type, setType] = useState<RequestType>('pagina_profissional')
  const [title, setTitle] = useState('Solicitação de página profissional')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const amount = suggestedAmounts[type]

  const onTypeChange = (value: RequestType) => {
    setType(value)
    setTitle(`Solicitação de ${requestTypeLabels[value].toLowerCase()}`)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Preencha título e descrição.')
      return
    }
    const req = createServiceRequest({
      type,
      title: title.trim(),
      description: description.trim(),
      amount,
      realtorId: getCurrentRealtorId() || 1,
      realtorName: getUserName() || 'Corretor',
    })
    setSuccess('Solicitação criada (simulada).')
    window.setTimeout(() => router.push(`/solicitacoes/${req.id}`), 700)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Solicitações', href: '/solicitacoes' },
          { label: 'Nova' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova solicitação</h1>
          <p className="text-sm text-muted-foreground">Pedido comercial/operacional — sem pagamento real.</p>
        </div>
        {success ? <SuccessNote message={success} /> : null}
        {error ? <Alert variant="destructive" description={error} /> : null}

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5">
          <Select
            label="Tipo"
            value={type}
            onChange={(e) => onTypeChange(e.target.value as RequestType)}
            options={Object.entries(requestTypeLabels).map(([value, label]) => ({ value, label }))}
          />
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
          {typeof amount === 'number' ? (
            <Alert
              variant="info"
              description={`Valor de referência: ${formatCurrency(amount)}${type === 'ia' ? ' (sugerido/provisório)' : type === 'pagina_profissional' ? '' : ' (provisório)'}.`}
            />
          ) : null}
          <div className="flex gap-2">
            <Button type="submit">Enviar</Button>
            <Link href="/solicitacoes">
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
