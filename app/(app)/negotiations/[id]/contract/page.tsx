'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import {
  Negotiation,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialNegotiations,
} from '@/lib/phase7-data'

export default function NegotiationContractPage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Negotiation | null>(null)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const found =
        filterByRealtor(initialNegotiations).find((n) => n.id === id) || null
      setItem(found)
      setGenerated(Boolean(found?.contractReady))
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive" description="Negociação não encontrada." />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Negociações', href: '/negotiations' },
          { label: item.code, href: `/negotiations/${item.id}` },
          { label: 'Contrato' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Contrato</h1>
            <p className="text-muted-foreground mt-1">Minuta simulada da compra e venda</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => setGenerated(true)}>
              Gerar minuta
            </Button>
            <Link href={`/negotiations/${item.id}/signature`}>
              <Button variant="outline">Ir para assinatura</Button>
            </Link>
          </div>
        </div>

        <Alert
          variant="info"
          title="Documento ilustrativo"
          description="Este contrato é fictício e não possui validade jurídica."
        />

        {!generated ? (
          <div className="bg-card border border-dashed border-border rounded-lg p-10 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma minuta gerada ainda.</p>
            <Button onClick={() => setGenerated(true)}>Gerar minuta agora</Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4 md:p-8 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">Instrumento Particular de Compra e Venda</h2>
              <Badge variant="success">Minuta pronta</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Referência {item.code} · Atualizado em {formatDateBR(item.updatedAt.slice(0, 10))}
            </p>
            <div className="space-y-3 text-sm text-foreground leading-relaxed">
              <p>
                Pelo presente instrumento, <strong>{item.ownerName}</strong> (Vendedor) e{' '}
                <strong>{item.clientName}</strong> (Comprador), intermediados pelo corretor{' '}
                <strong>{item.realtorName}</strong>, acordam a compra e venda do imóvel{' '}
                <strong>{item.propertyTitle}</strong>, situado em {item.propertyAddress}.
              </p>
              <p>
                O preço total ajustado é de <strong>{formatCurrency(item.offeredValue)}</strong>, sendo{' '}
                <strong>{formatCurrency(item.downPayment)}</strong> a título de entrada e{' '}
                <strong>{formatCurrency(item.financing)}</strong> mediante financiamento.
              </p>
              <p>
                Condições especiais: {item.conditions}
              </p>
              <p>
                A comissão de corretagem correspondente a {item.commissionPercent}% (
                {formatCurrency(item.commissionValue)}) será devida conforme práticas do mercado e
                políticas da plataforma ImóvelHub.
              </p>
              <p>
                Prazo estimado para conclusão dos atos: {formatDateBR(item.deadline)}.
              </p>
            </div>
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-sm">
              <div>
                <div className="border-t border-border pt-3">Vendedor — {item.ownerName}</div>
              </div>
              <div>
                <div className="border-t border-border pt-3">Comprador — {item.clientName}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
