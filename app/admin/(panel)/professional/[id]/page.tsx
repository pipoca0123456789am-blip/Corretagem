'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin } from '@/lib/auth'
import {
  ConfirmActionModal,
  Phase12State,
  RequestTimeline,
  StatusBadge,
  SuccessBanner,
  useUiLoad,
} from '@/components/professional/shared'
import {
  ProfessionalRequest,
  ProfessionalRequestStatus,
  formatCurrency,
  getProfessionalRequestById,
  professionalStatusLabels,
  updateRequestStatus,
  upsertProfessionalRequest,
} from '@/lib/phase12-data'
import { labelPt, materialStatusLabels } from '@/lib/labels-pt'

export default function AdminProfessionalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useUiLoad()
  const [allowed, setAllowed] = useState(false)
  const [request, setRequest] = useState<ProfessionalRequest | null>(null)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')
  const [confirm, setConfirm] = useState<'approve' | 'cancel' | 'suspend' | 'publish' | null>(null)

  const refresh = () => setRequest(getProfessionalRequestById(id) || null)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    refresh()
  }, [id, router, state])

  if (!allowed) return null

  const save = (next: ProfessionalRequest, msg: string) => {
    upsertProfessionalRequest(next)
    setRequest(next)
    setSuccess(msg)
  }

  const applyStatus = (status: ProfessionalRequestStatus, note?: string) => {
    const updated = updateRequestStatus(id, status, note)
    if (updated) {
      setRequest(updated)
      setSuccess(`Status atualizado para ${professionalStatusLabels[status]}.`)
    }
    setConfirm(null)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Pág. Profissional', href: '/admin/professional' },
          { label: id },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        {success ? <SuccessBanner message={success} onClose={() => setSuccess('')} /> : null}

        <Phase12State
          state={state === 'ready' && !request ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Solicitação não encontrada', description: 'Verifique o ID informado.' }}
        >
          {request ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{request.realtorName}</h1>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.id} · {formatCurrency(request.price)} · atualizado em {request.updatedAt}
                  </p>
                </div>
                <Link href="/admin/professional">
                  <Button variant="outline">Voltar à lista</Button>
                </Link>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <section className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold text-foreground">Detalhes e pagamento</h2>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <p><span className="text-muted-foreground">Pagamento:</span> {request.paymentStatus}</p>
                    <p><span className="text-muted-foreground">Método:</span> {request.paymentMethod || '—'}</p>
                    <p><span className="text-muted-foreground">Slug:</span> /corretor/{request.form.slug}</p>
                    <p><span className="text-muted-foreground">Domínio:</span> {request.form.wantsDomain ? request.form.customDomain || 'Solicitado' : 'Não'}</p>
                  </div>
                  <Input
                    label="Responsável pela produção"
                    value={request.producer}
                    onChange={(e) => setRequest({ ...request, producer: e.target.value })}
                  />
                  <Input
                    label="Prazo"
                    type="date"
                    value={request.dueDate}
                    onChange={(e) => setRequest({ ...request, dueDate: e.target.value })}
                  />
                  <Select
                    label="Status"
                    value={request.status}
                    onChange={(e) =>
                      setRequest({ ...request, status: e.target.value as ProfessionalRequestStatus })
                    }
                    options={Object.entries(professionalStatusLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                  <Button
                    onClick={() => {
                      const updated = updateRequestStatus(request.id, request.status, 'Status ajustado pelo admin')
                      if (updated) {
                        save(
                          { ...updated, producer: request.producer, dueDate: request.dueDate },
                          'Detalhes salvos.'
                        )
                      }
                    }}
                  >
                    Salvar alterações
                  </Button>
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Linha do tempo</h2>
                  <RequestTimeline request={request} />
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Materiais</h2>
                  {request.materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum material enviado.</p>
                  ) : (
                    <ul className="space-y-2">
                      {request.materials.map((m) => (
                        <li key={m.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                          <span>{m.name} · {m.type}</span>
                          <Badge variant={m.status === 'aprovado' ? 'success' : 'info'}>{labelPt(materialStatusLabels, m.status)}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Alert className="mt-3" variant="info" description="Upload real não habilitado — apenas visualização." />
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Checklist</h2>
                  <div className="space-y-2">
                    {request.checklist.map((item, index) => (
                      <Checkbox
                        key={item.id}
                        checked={item.done}
                        label={item.label}
                        onCheckedChange={(checked) => {
                          const checklist = [...request.checklist]
                          checklist[index] = { ...item, done: checked }
                          setRequest({ ...request, checklist })
                        }}
                      />
                    ))}
                  </div>
                  <Button
                    className="mt-3"
                    variant="outline"
                    onClick={() => save(request, 'Checklist atualizado.')}
                  >
                    Salvar checklist
                  </Button>
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Mensagens</h2>
                  <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                    {request.messages.map((msg) => (
                      <div key={msg.id} className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                        <p className="font-medium text-foreground">{msg.from} · {msg.at}</p>
                        <p className="text-muted-foreground">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  <Textarea label="Nova mensagem" value={message} onChange={(e) => setMessage(e.target.value)} />
                  <Button
                    className="mt-2"
                    onClick={() => {
                      if (!message.trim()) return
                      const next = {
                        ...request,
                        messages: [
                          ...request.messages,
                          {
                            id: `msg-${Date.now()}`,
                            from: 'admin' as const,
                            text: message,
                            at: new Date().toLocaleString('pt-BR'),
                          },
                        ],
                      }
                      setMessage('')
                      save(next, 'Mensagem registrada (simulado).')
                    }}
                  >
                    Enviar
                  </Button>
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold text-foreground">Ajustes solicitados</h2>
                  {request.adjustments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum ajuste até o momento.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {request.adjustments.map((item) => (
                        <li key={item} className="rounded-lg border border-border px-3 py-2">{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>

              <section className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-3 font-semibold text-foreground">Ações com confirmação</h2>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => setConfirm('approve')}>Marcar aprovado</Button>
                  <Button variant="secondary" onClick={() => setConfirm('publish')}>Publicar</Button>
                  <Button variant="outline" onClick={() => setConfirm('suspend')}>Suspender</Button>
                  <Button variant="danger" onClick={() => setConfirm('cancel')}>Cancelar</Button>
                </div>
              </section>
            </>
          ) : null}
        </Phase12State>

        <ConfirmActionModal
          open={confirm === 'approve'}
          title="Confirmar aprovação?"
          description="O status será alterado para Aprovado."
          confirmLabel="Confirmar aprovação"
          onClose={() => setConfirm(null)}
          onConfirm={() => applyStatus('aprovado')}
        />
        <ConfirmActionModal
          open={confirm === 'publish'}
          title="Confirmar publicação?"
          description="Publicação simulada — a vitrine pública existente será referenciada."
          confirmLabel="Publicar"
          onClose={() => setConfirm(null)}
          onConfirm={() => applyStatus('publicado', 'Publicado pelo Super Admin')}
        />
        <ConfirmActionModal
          open={confirm === 'suspend'}
          title="Suspender página?"
          description="O status mudará para Suspenso. Esta ação exige confirmação."
          confirmLabel="Suspender"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => applyStatus('suspenso')}
        />
        <ConfirmActionModal
          open={confirm === 'cancel'}
          title="Cancelar solicitação?"
          description="O pedido será marcado como Cancelado. Confirme para continuar."
          confirmLabel="Cancelar solicitação"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => applyStatus('cancelado')}
        />
      </div>
    </div>
  )
}
