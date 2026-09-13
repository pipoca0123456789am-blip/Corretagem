'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Progress } from '@/components/design-system/feedback/progress'
import { isSuperAdmin } from '@/lib/auth'
import {
  AiPageState,
  AiStatusBadge,
  ConfirmModal,
  SuccessNote,
  useAiLoad,
} from '@/components/ai-agent/shared'
import {
  AiIntegration,
  AiIntegrationStatus,
  aiStatusLabels,
  formatCurrency,
  getAiById,
  getAuthorizedProperties,
  updateAiStatus,
  upsertAi,
} from '@/lib/phase13-data'

export default function AdminAiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useAiLoad()
  const [allowed, setAllowed] = useState(false)
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [supportNote, setSupportNote] = useState('')
  const [success, setSuccess] = useState('')
  const [confirm, setConfirm] = useState<'suspend' | 'cancel' | 'activate' | null>(null)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setAi(getAiById(id) || null)
  }, [id, router, state])

  if (!allowed) return null

  const apply = (status: AiIntegrationStatus, note?: string) => {
    const updated = updateAiStatus(id, status, note)
    if (updated) setAi(updated)
    setSuccess(`Status: ${aiStatusLabels[status]}`)
    setConfirm(null)
  }

  const saveMeta = () => {
    if (!ai) return
    upsertAi(ai)
    setSuccess('Dados administrativos salvos.')
  }

  const pct = ai
    ? Math.round((ai.consumption.messagesUsed / Math.max(ai.consumption.messagesLimit, 1)) * 100)
    : 0

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Agentes de IA', href: '/admin/ai' },
          { label: id },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        <AiPageState
          state={state === 'ready' && !ai ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Agente não encontrado', description: 'Verifique o ID.' }}
        >
          {ai ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{ai.realtorName}</h1>
                    <AiStatusBadge status={ai.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ai.config.name} · {formatCurrency(ai.price)}
                    {ai.provisionalPrice ? ' (provisório)' : ''}
                  </p>
                </div>
                <Link href="/admin/ai"><Button variant="outline">Voltar</Button></Link>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="space-y-3 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">Pagamento e faturamento</h2>
                  <p className="text-sm">Status pagamento: <strong>{ai.paymentStatus}</strong></p>
                  <p className="text-sm">Método: <strong>{ai.paymentMethod || '—'}</strong></p>
                  <p className="text-sm text-muted-foreground">{ai.billingNote}</p>
                  <Select
                    label="Status da integração"
                    value={ai.status}
                    onChange={(e) => setAi({ ...ai, status: e.target.value as AiIntegrationStatus })}
                    options={Object.entries(aiStatusLabels).map(([value, label]) => ({ value, label }))}
                  />
                  <Input
                    label="Limite de mensagens"
                    type="number"
                    value={String(ai.consumption.messagesLimit)}
                    onChange={(e) =>
                      setAi({
                        ...ai,
                        consumption: {
                          ...ai.consumption,
                          messagesLimit: Number(e.target.value) || ai.consumption.messagesLimit,
                        },
                      })
                    }
                  />
                  <Button onClick={saveMeta}>Salvar</Button>
                </section>

                <section className="space-y-3 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">WhatsApp e consumo</h2>
                  <Badge variant={ai.whatsappConnected ? 'success' : 'warning'}>
                    {ai.whatsappConnected ? 'Conectado (simulado)' : 'Não conectado'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{ai.config.whatsappLabel}</p>
                  <Progress value={pct} label="Consumo do ciclo" />
                  <p className="text-sm">
                    {ai.consumption.messagesUsed}/{ai.consumption.messagesLimit} mensagens ·{' '}
                    {ai.consumption.followUpsSent} follow-ups
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      upsertAi({ ...ai, whatsappConnected: !ai.whatsappConnected })
                      setAi(getAiById(id) || null)
                      setSuccess('Status de conexão WhatsApp atualizado (simulado).')
                    }}
                  >
                    Alternar conexão WhatsApp
                  </Button>
                </section>

                <section className="space-y-3 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">Agente e limites</h2>
                  <p className="text-sm"><strong>Tom:</strong> {ai.config.tone} · {ai.config.style}</p>
                  <p className="text-sm"><strong>Horário:</strong> {ai.config.businessHours}</p>
                  <p className="text-sm"><strong>Handoff:</strong> {ai.config.humanHandoffEnabled ? 'Sim' : 'Não'}</p>
                  <p className="text-sm"><strong>Triggers:</strong> {ai.config.triggerWords.join(', ')}</p>
                  <div>
                    <p className="mb-2 text-sm font-medium">Imóveis autorizados (carteira do corretor)</p>
                    <div className="flex flex-wrap gap-1">
                      {getAuthorizedProperties(ai).map((p) => (
                        <Badge key={p.id} variant="default">{p.title}</Badge>
                      ))}
                      {getAuthorizedProperties(ai).length === 0 ? (
                        <span className="text-sm text-muted-foreground">Nenhum</span>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="space-y-3 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">Falhas e suporte</h2>
                  {ai.alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem alertas.</p>
                  ) : (
                    ai.alerts.map((a) => (
                      <div key={a.id} className="rounded-lg border border-border p-3 text-sm">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-muted-foreground">{a.detail}</p>
                      </div>
                    ))
                  )}
                  <Textarea
                    label="Nota de suporte"
                    value={supportNote}
                    onChange={(e) => setSupportNote(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!supportNote.trim()) return
                      upsertAi({
                        ...ai,
                        history: [
                          {
                            id: `h-${Date.now()}`,
                            label: `Suporte: ${supportNote}`,
                            at: new Date().toLocaleString('pt-BR'),
                          },
                          ...ai.history,
                        ],
                      })
                      setSupportNote('')
                      setAi(getAiById(id) || null)
                      setSuccess('Nota de suporte registrada.')
                    }}
                  >
                    Registrar suporte
                  </Button>
                </section>
              </div>

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-3 font-semibold text-foreground">Histórico</h2>
                <ul className="space-y-2 text-sm">
                  {ai.history.map((h) => (
                    <li key={h.id} className="flex justify-between gap-2 border-b border-border py-2">
                      <span>{h.label}</span>
                      <span className="text-muted-foreground">{h.at}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-3 font-semibold text-foreground">Ações com confirmação</h2>
                <Alert className="mb-3" variant="info" description="Sem IA, WhatsApp ou cobrança reais." />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setConfirm('activate')}>Ativar</Button>
                  <Button variant="outline" onClick={() => setConfirm('suspend')}>Suspender</Button>
                  <Button variant="danger" onClick={() => setConfirm('cancel')}>Cancelar</Button>
                </div>
              </section>
            </>
          ) : null}
        </AiPageState>

        <ConfirmModal
          open={confirm === 'activate'}
          title="Ativar agente?"
          description="Status mudará para Ativo (simulado)."
          confirmLabel="Ativar"
          onClose={() => setConfirm(null)}
          onConfirm={() => apply('ativo', 'Ativado pelo Super Admin')}
        />
        <ConfirmModal
          open={confirm === 'suspend'}
          title="Suspender agente?"
          description="O corretor deixará de usar a IA até reativação."
          confirmLabel="Suspender"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => apply('suspenso')}
        />
        <ConfirmModal
          open={confirm === 'cancel'}
          title="Cancelar integração?"
          description="A solicitação será marcada como cancelada."
          confirmLabel="Cancelar integração"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => apply('cancelado')}
        />
      </div>
    </div>
  )
}
