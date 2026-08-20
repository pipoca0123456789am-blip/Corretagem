'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { isSuperAdmin, isSupportAgent, getUserName } from '@/lib/auth'
import {
  RequestStatusBadge,
  SuccessNote,
  SupportState,
  Timeline,
  useSupportLoad,
} from '@/components/support/shared'
import {
  RequestStatus,
  ServiceRequest,
  formatCurrency,
  getRequestById,
  loadRequests,
  nowLabel,
  requestStatusLabels,
  requestTypeLabels,
  upsertRequest,
} from '@/lib/phase16-data'

export default function AdminRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { state, reload } = useSupportLoad()
  const [allowed, setAllowed] = useState(false)
  const [item, setItem] = useState<ServiceRequest | null>(null)
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isSuperAdmin() && !isSupportAgent()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
    setItem(getRequestById(id) || loadRequests().find((r) => r.id === id) || null)
  }, [id, router, state])

  if (!allowed) return null

  const save = (next: ServiceRequest, message: string) => {
    upsertRequest(next)
    setItem(next)
    setSuccess(message)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Solicitações', href: '/admin/requests' },
          { label: id },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}

        <SupportState
          state={state === 'ready' && !item ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Solicitação não encontrada',
            action: { label: 'Voltar', onClick: () => router.push('/admin/requests') },
          }}
        >
          {item ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                    <RequestStatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.realtorName} · {requestTypeLabels[item.type]}
                    {typeof item.amount === 'number' ? ` · ${formatCurrency(item.amount)}` : ''}
                  </p>
                </div>
                <Link href="/admin/requests">
                  <Button variant="outline">Voltar</Button>
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                  <h2 className="font-semibold">Descrição</h2>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <Select
                    label="Status"
                    value={item.status}
                    onChange={(e) => {
                      const status = e.target.value as RequestStatus
                      save(
                        {
                          ...item,
                          status,
                          updatedAt: new Date().toISOString(),
                          timeline: [
                            {
                              id: `t-${Date.now()}`,
                              label: `Status: ${requestStatusLabels[status]}`,
                              at: nowLabel(),
                              actor: getUserName() || 'Equipe',
                            },
                            ...item.timeline,
                          ],
                        },
                        'Status atualizado.'
                      )
                    }}
                    options={Object.entries(requestStatusLabels).map(([value, label]) => ({
                      value,
                      label,
                    }))}
                  />
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="mb-3 font-semibold">Histórico</h2>
                  <Timeline events={item.timeline} />
                </div>

                <div className="rounded-xl border border-warning/40 bg-warning/5 p-5 lg:col-span-2">
                  <h2 className="font-semibold">Observações internas</h2>
                  <Alert
                    className="mt-2"
                    variant="warning"
                    description="Estas notas não aparecem para o corretor."
                  />
                  <ul className="mt-3 space-y-2">
                    {item.internalNotes.map((n) => (
                      <li key={n.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                        <p>{n.body}</p>
                        <p className="text-xs text-muted-foreground">
                          {n.authorName} · {n.at}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <Textarea
                    className="mt-3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Nota interna..."
                  />
                  <Button
                    className="mt-2"
                    variant="outline"
                    disabled={!note.trim()}
                    onClick={() => {
                      if (!note.trim()) return
                      save(
                        {
                          ...item,
                          internalNotes: [
                            {
                              id: `n-${Date.now()}`,
                              body: note.trim(),
                              authorName: getUserName() || 'Equipe',
                              at: nowLabel(),
                            },
                            ...item.internalNotes,
                          ],
                          updatedAt: new Date().toISOString(),
                        },
                        'Observação interna salva.'
                      )
                      setNote('')
                    }}
                  >
                    Salvar observação
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SupportState>
      </div>
    </div>
  )
}
