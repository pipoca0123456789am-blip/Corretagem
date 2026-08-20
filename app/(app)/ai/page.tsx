'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { isSuperAdmin } from '@/lib/auth'
import {
  AiPageState,
  AiPromoCard,
  AiStatusBadge,
  ConfirmModal,
  SuccessNote,
  useAiLoad,
} from '@/components/ai-agent/shared'
import {
  AiIntegration,
  formatCurrency,
  getRealtorAi,
  loadAiIntegrations,
  updateAiStatus,
} from '@/lib/phase13-data'

export default function AiHubPage() {
  const { state, reload } = useAiLoad()
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [success, setSuccess] = useState('')
  const [confirmPause, setConfirmPause] = useState(false)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    loadAiIntegrations()
    setAdmin(isSuperAdmin())
    setAi(getRealtorAi())
  }, [state])

  const refresh = () => setAi(getRealtorAi())

  const togglePause = () => {
    if (!ai) return
    const next = ai.status === 'pausado' ? 'ativo' : 'pausado'
    updateAiStatus(ai.id, next, next === 'pausado' ? 'IA pausada pelo corretor' : 'IA reativada')
    setConfirmPause(false)
    setSuccess(next === 'pausado' ? 'IA pausada.' : 'IA ativada.')
    refresh()
  }

  const contracted = ai && !['nao_contratado', 'cancelado'].includes(ai.status)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'IA WhatsApp' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">IA individual + WhatsApp</h1>
            <p className="text-sm text-muted-foreground">
              Agente isolado da sua carteira · valor sugerido {formatCurrency(97)} (provisório)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/ai/exemplos"><Button variant="outline">Exemplos</Button></Link>
            <Link href="/ai/conversas"><Button variant="outline">Conversas</Button></Link>
          </div>
        </div>

        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        {admin ? (
          <Alert
            variant="info"
            title="Modo Super Admin"
            description="A visão global dos agentes está em Agentes de IA. Este hub é o painel individual do corretor."
          />
        ) : null}
        {admin ? (
          <Link href="/admin/ai">
            <Button variant="secondary">Abrir visão global de IA</Button>
          </Link>
        ) : null}

        <AiPageState state={state} onRetry={reload}>
          {!contracted ? (
            <>
              <AiPromoCard />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { href: '/ai/beneficios', label: 'Benefícios' },
                  { href: '/ai/exemplos', label: 'Exemplos de atendimento' },
                  { href: '/ai/solicitar', label: 'Solicitar integração' },
                  { href: '/ai/configuracao', label: 'Prévia de configuração' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-xl border border-border bg-card p-4 text-sm font-medium hover:border-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">{ai!.config.name}</h2>
                  <AiStatusBadge status={ai!.status} />
                  {ai!.provisionalPrice ? <Badge variant="info">R$ 97 provisório</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  WhatsApp {ai!.whatsappConnected ? 'conectado (simulado)' : 'pendente'} ·{' '}
                  {ai!.config.whatsappLabel}
                </p>
                <Alert
                  variant="info"
                  title="Isolamento por corretor"
                  description="Este agente acessa apenas seus imóveis, clientes e regras. Sem IA ou WhatsApp reais nesta fase."
                />
                <div className="flex flex-wrap gap-2">
                  <Link href="/ai/conversas"><Button>Abrir conversas</Button></Link>
                  <Link href="/ai/configuracao"><Button variant="secondary">Configurar agente</Button></Link>
                  {ai!.status === 'aguardando_pagamento' ? (
                    <Link href="/ai/checkout"><Button variant="outline">Checkout</Button></Link>
                  ) : null}
                  <Button
                    variant="outline"
                    onClick={() => setConfirmPause(true)}
                    disabled={!['ativo', 'pausado', 'em_testes'].includes(ai!.status)}
                  >
                    {ai!.status === 'pausado' ? 'Ativar IA' : 'Pausar IA'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Conversas" value={String(ai!.metrics.conversations)} />
                  <Metric label="Leads" value={String(ai!.metrics.leadsQualified)} />
                  <Metric label="Visitas" value={String(ai!.metrics.visitsScheduled)} />
                  <Metric label="Handoffs" value={String(ai!.metrics.handoffs)} />
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">Atalhos</h3>
                {[
                  { href: '/ai/metricas', label: 'Métricas' },
                  { href: '/ai/consumo', label: 'Consumo' },
                  { href: '/ai/historico', label: 'Histórico' },
                  { href: '/ai/alertas', label: 'Falhas e alertas' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </AiPageState>

        <ConfirmModal
          open={confirmPause}
          title={ai?.status === 'pausado' ? 'Ativar IA?' : 'Pausar IA?'}
          description="A ação é simulada e afeta apenas o seu agente."
          confirmLabel="Confirmar"
          onClose={() => setConfirmPause(false)}
          onConfirm={togglePause}
        />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}
