'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  Globe,
  LayoutTemplate,
  Package,
  Sparkles,
  Users,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Modal } from '@/components/design-system/feedback/modal'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { isSuperAdmin } from '@/lib/auth'
import {
  ContractedService,
  filterByRealtor,
  formatCurrency,
  formatDateBR,
  initialServices,
  initialUpcomingPayments,
} from '@/lib/phase8-data'
import { labelPt, serviceStatusLabels } from '@/lib/labels-pt'

const typeIcon = {
  assinatura: Sparkles,
  pagina_profissional: LayoutTemplate,
  ia: Bot,
  usuarios: Users,
  dominio: Globe,
  outro: Package,
}

const statusBadge = (status: ContractedService['status']) => {
  const map = {
    ativo: 'success' as const,
    pendente: 'warning' as const,
    cancelado: 'destructive' as const,
    trial: 'info' as const,
  }
  return map[status]
}

export default function ServicesPage() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<ContractedService[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [cancelItem, setCancelItem] = useState<ContractedService | null>(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const t = setTimeout(() => {
      setServices(filterByRealtor(initialServices))
      setLoading(false)
    }, 450)
    return () => clearTimeout(t)
  }, [])

  const monthly = useMemo(
    () => services.filter((s) => s.status === 'ativo').reduce((sum, s) => sum + s.monthlyValue, 0),
    [services]
  )

  const upcoming = useMemo(
    () => filterByRealtor(initialUpcomingPayments).filter((p) => p.type === 'servico'),
    []
  )

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Financeiro', href: '/financial' },
          { label: 'Serviços contratados' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Serviços contratados</h1>
          <p className="text-muted-foreground mt-1">
            Assinatura, página profissional, IA, usuários e domínio
          </p>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard title="Custo mensal ativo" value={formatCurrency(monthly)} description="Recorrências ativas" />
          <MetricCard title="Serviços ativos" value={String(services.filter((s) => s.status === 'ativo').length)} description="Na carteira atual" />
        </div>

        {services.length === 0 ? (
          <EmptyState title="Nenhum serviço" description="Você ainda não possui serviços contratados." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map((service) => {
              const Icon = typeIcon[service.type]
              return (
                <div key={service.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{service.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{service.plan}</p>
                      </div>
                    </div>
                    <Badge variant={statusBadge(service.status)}>{labelPt(serviceStatusLabels, service.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="font-medium text-foreground">
                      {service.monthlyValue > 0 ? `${formatCurrency(service.monthlyValue)}/mês` : 'Avulso'}
                    </p>
                    <p className="text-muted-foreground">
                      Próx. pagamento {formatDateBR(service.nextPayment)}
                    </p>
                  </div>
                  {isAdmin && (
                    <p className="text-xs text-muted-foreground">{service.realtorName}</p>
                  )}
                  {service.status === 'ativo' && (
                    <Button size="sm" variant="outline" onClick={() => setCancelItem(service)}>
                      Solicitar cancelamento
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <h2 className="font-semibold text-foreground mb-4">Próximos pagamentos de serviços</h2>
          <div className="space-y-3">
            {upcoming.map((pay) => (
              <div key={pay.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{pay.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateBR(pay.dueDate)}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(pay.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!cancelItem}
        onClose={() => setCancelItem(null)}
        title="Cancelar serviço"
        description="Confirma a solicitação de cancelamento? (simulado)"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setCancelItem(null)}>Voltar</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!cancelItem) return
                setServices((prev) =>
                  prev.map((s) =>
                    s.id === cancelItem.id ? { ...s, status: 'cancelado' } : s
                  )
                )
                setCancelItem(null)
                setSuccess('Solicitação de cancelamento registrada (simulada).')
                setTimeout(() => setSuccess(''), 3000)
              }}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {cancelItem?.name} · {cancelItem ? formatCurrency(cancelItem.monthlyValue) : ''}/mês
        </p>
      </Modal>
    </div>
  )
}
