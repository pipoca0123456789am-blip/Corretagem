'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { isSuperAdmin } from '@/lib/auth'
import { propertiesList, realtorsList } from '@/lib/mock-data'
import { labelPt, planNameLabels, propertyStatusLabels } from '@/lib/labels-pt'
import { publicRealtorProfiles } from '@/lib/phase9-data'
import {
  getAllProfessionalRequests,
  professionalStatusLabels,
  type ProfessionalRequest,
} from '@/lib/phase12-data'
import {
  aiStatusLabels,
  getAllAiIntegrations,
  type AiIntegration,
} from '@/lib/phase13-data'
import {
  getRealtorSubscription,
  loadPlans,
  subscriptionStatusLabels,
  type Subscription,
} from '@/lib/phase14-data'
import { loadRequests, loadTickets } from '@/lib/phase16-data'

export default function AdminRealtorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  const [allowed, setAllowed] = useState(false)
  const [page, setPage] = useState<ProfessionalRequest | null>(null)
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [sub, setSub] = useState<Subscription | null>(null)
  const [ticketsOpen, setTicketsOpen] = useState(0)
  const [requestsOpen, setRequestsOpen] = useState(0)

  const realtor = useMemo(() => realtorsList.find((r) => r.id === id) || null, [id])
  const profile = useMemo(() => publicRealtorProfiles.find((p) => p.id === id) || null, [id])
  const properties = useMemo(
    () => propertiesList.filter((p) => p.realtor?.id === id),
    [id]
  )
  const plans = useMemo(() => loadPlans(), [])

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    const professional = getAllProfessionalRequests().find((p) => p.realtorId === id) || null
    const integration = getAllAiIntegrations().find((a) => a.realtorId === id) || null
    setPage(professional)
    setAi(integration)
    setSub(getRealtorSubscription(id))
    setTicketsOpen(
      loadTickets().filter(
        (t) =>
          t.realtorId === id && !['resolvido', 'encerrado'].includes(t.status)
      ).length
    )
    setRequestsOpen(
      loadRequests().filter(
        (r) => r.realtorId === id && !['concluida', 'recusada', 'cancelada'].includes(r.status)
      ).length
    )
  }, [id, router])

  if (!allowed) return null

  if (!realtor) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Corretor não encontrado"
          description="Este ID não existe na base demo."
          action={{ label: 'Voltar', onClick: () => router.push('/admin/realtors') }}
        />
      </div>
    )
  }

  const planName = plans.find((p) => p.id === sub?.planId)?.name

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Corretores', href: '/admin/realtors' },
          { label: realtor.name },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Ficha do corretor · gestão da plataforma
            </p>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{realtor.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {realtor.email} · {realtor.phone} · {realtor.region}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={realtor.status === 'active' ? 'success' : 'secondary'}>
                {realtor.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant="primary">{labelPt(planNameLabels, realtor.plan)}</Badge>
              <Badge variant="default">Desde {realtor.joinedAt}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile ? (
              <Link href={`/corretor/${profile.slug}`} target="_blank">
                <Button size="sm" variant="outline">
                  Abrir vitrine pública
                </Button>
              </Link>
            ) : null}
            <Link href="/admin/realtors">
              <Button size="sm" variant="secondary">
                Voltar à lista
              </Button>
            </Link>
          </div>
        </div>

        <Alert
          variant="info"
          description="Esta ficha reúne tudo que a plataforma gerencia sobre o corretor: conta, assinatura, página profissional, IA, imóveis e suporte — sem misturar com o painel operacional dele."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Imóveis na carteira" value={properties.length} description="Visão global" />
          <MetricCard title="Vendas no mês" value={realtor.salesThisMonth} description={realtor.totalSales} />
          <MetricCard title="Chamados abertos" value={ticketsOpen} description={`${requestsOpen} solicitações`} />
          <MetricCard title="Avaliação" value={realtor.rating} description={`Comissão ${realtor.commissionRate}%`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Assinatura SaaS</h2>
              {sub ? (
                <Link href={`/admin/subscriptions/${sub.id}`}>
                  <Button size="sm" variant="outline">
                    Gerir assinatura
                  </Button>
                </Link>
              ) : null}
            </div>
            {sub ? (
              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">{planName || sub.planId}</Badge>
                  <Badge variant="secondary">{subscriptionStatusLabels[sub.status]}</Badge>
                </div>
                <p className="text-muted-foreground">
                  Renova em {sub.renewsAt} · {sub.propertiesUsed} imóveis · {sub.usersUsed} usuários
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem assinatura vinculada nesta demo.</p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Página profissional</h2>
              {page ? (
                <Link href={`/admin/professional/${page.id}`}>
                  <Button size="sm" variant="outline">
                    Gerir produção
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/professional">
                  <Button size="sm" variant="outline">
                    Ver fila
                  </Button>
                </Link>
              )}
            </div>
            {page ? (
              <div className="space-y-2 text-sm">
                <Badge variant="info">{professionalStatusLabels[page.status]}</Badge>
                <p className="text-muted-foreground">
                  /corretor/{page.form.slug}
                  {page.form.wantsDomain ? ` · domínio ${page.form.customDomain || 'pendente'}` : ''}
                </p>
                <p className="text-muted-foreground">
                  Produtor: {page.producer} · prazo {page.dueDate}
                </p>
              </div>
            ) : profile ? (
              <div className="space-y-2 text-sm">
                <Badge variant="success">Vitrine publicada</Badge>
                <p className="text-muted-foreground">/corretor/{profile.slug}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda sem página profissional.</p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">IA WhatsApp</h2>
              {ai ? (
                <Link href={`/admin/ai/${ai.id}`}>
                  <Button size="sm" variant="outline">
                    Gerir IA
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/ai">
                  <Button size="sm" variant="outline">
                    Ver integrações
                  </Button>
                </Link>
              )}
            </div>
            {ai ? (
              <div className="space-y-2 text-sm">
                <Badge variant="info">{aiStatusLabels[ai.status]}</Badge>
                <p className="text-muted-foreground">
                  {ai.conversations?.length || 0} conversas demo · alertas{' '}
                  {ai.alerts?.filter((a) => !a.resolved).length || 0}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">IA não contratada para este corretor.</p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Suporte e solicitações</h2>
              <div className="flex gap-2">
                <Link href="/admin/support">
                  <Button size="sm" variant="outline">
                    Suporte
                  </Button>
                </Link>
                <Link href="/admin/requests">
                  <Button size="sm" variant="outline">
                    Solicitações
                  </Button>
                </Link>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {ticketsOpen} chamado(s) aberto(s) · {requestsOpen} solicitação(ões) em andamento
            </p>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Imóveis da carteira</h2>
            <Link href="/admin/properties">
              <Button size="sm" variant="outline">
                Visão global
              </Button>
            </Link>
          </div>
          {properties.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum imóvel vinculado a este corretor na demo.</p>
          ) : (
            <div className="space-y-2">
              {properties.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{labelPt(propertyStatusLabels, p.status)}</Badge>
                    <Link href={`/properties/${p.id}`}>
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              alert('Ação simulada: edição de dados do corretor (sem backend).')
            }
          >
            Editar dados (simulado)
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              alert('Ação simulada: suspensão de conta (sem backend).')
            }
          >
            Suspender conta (simulado)
          </Button>
        </div>
      </div>
    </div>
  )
}
