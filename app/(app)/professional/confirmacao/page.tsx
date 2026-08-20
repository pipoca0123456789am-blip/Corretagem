'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'

export default function ProfessionalConfirmationPage() {
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Confirmação' },
        ]}
      />
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <Alert
          variant="success"
          title="Pedido confirmado"
          description="Recebemos sua solicitação e o pagamento visual de R$ 497,00. A produção foi iniciada."
        />
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p>Próximos passos:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Equipe de produção monta o layout</li>
            <li>Você recebe aviso para revisão</li>
            <li>Pode solicitar ajustes ou aprovar</li>
            <li>Após aprovação, a página é publicada</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/professional/acompanhamento">
            <Button>Acompanhar pedido</Button>
          </Link>
          <Link href="/professional">
            <Button variant="outline">Voltar ao hub</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
