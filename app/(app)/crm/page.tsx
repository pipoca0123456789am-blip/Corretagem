'use client'

import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Search, UserPlus } from 'lucide-react'
import { getCurrentRealtorId } from '@/lib/phase7-data'

const STORAGE_KEY = 'imovelhub_crm_leads'

const stages = [
  { id: 'novo', label: 'Novos' },
  { id: 'contato', label: 'Em contato' },
  { id: 'qualificado', label: 'Qualificados' },
  { id: 'visita', label: 'Visitas' },
  { id: 'negociacao', label: 'Em negociação' },
  { id: 'convertido', label: 'Convertidos' },
  { id: 'perdido', label: 'Perdidos' },
] as const

type LeadStage = (typeof stages)[number]['id']

type CrmLead = {
  id: string
  realtorId: number
  name: string
  email: string
  phone: string
  source: string
  status: LeadStage
  createdAt: string
  notes?: string
}

function isLeadStage(value: unknown): value is LeadStage {
  return stages.some((stage) => stage.id === value)
}

function isStoredLead(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function parseLeads(value: string | null): CrmLead[] {
  if (!value) return []
  const parsed: unknown = JSON.parse(value)
  if (!Array.isArray(parsed)) throw new Error('Os dados salvos do CRM estão em um formato inválido.')

  return parsed.map((item): CrmLead => {
    if (
      !isStoredLead(item) ||
      typeof item.id !== 'string' ||
      typeof item.realtorId !== 'number' ||
      typeof item.name !== 'string'
    ) {
      throw new Error('Há um lead com dados incompletos no armazenamento local.')
    }

    return {
      id: item.id,
      realtorId: item.realtorId,
      name: item.name,
      email: typeof item.email === 'string' ? item.email : '',
      phone: typeof item.phone === 'string' ? item.phone : '',
      source: typeof item.source === 'string' ? item.source : 'Cadastro manual',
      status: isLeadStage(item.status) ? item.status : 'novo',
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
      notes: typeof item.notes === 'string' ? item.notes : '',
    }
  })
}

export default function CrmPage() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [realtorId, setRealtorId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentRealtorId = getCurrentRealtorId() ?? 1
    setRealtorId(currentRealtorId)
    let cancelled = false

    void (async () => {
      try {
        const response = await fetch('/api/leads', { credentials: 'same-origin' })
        const data: unknown = await response.json()
        if (
          !response.ok ||
          !data ||
          typeof data !== 'object' ||
          !('items' in data) ||
          !Array.isArray(data.items)
        ) {
          throw new Error('Não foi possível carregar os leads vinculados à sua conta.')
        }

        const tenantId =
          'tenantId' in data && typeof data.tenantId === 'number'
            ? data.tenantId
            : currentRealtorId
        const savedLeads = parseLeads(window.localStorage.getItem(STORAGE_KEY))
          .filter((lead) => lead.realtorId === tenantId)
        const serverLeads = parseLeads(JSON.stringify(data.items))
          .filter((lead) => lead.realtorId === tenantId)
        const savedById = new Map(savedLeads.map((lead) => [lead.id, lead]))
        const serverIds = new Set(serverLeads.map((lead) => lead.id))
        const mergedLeads = [
          ...serverLeads.map((lead) => ({ ...lead, ...savedById.get(lead.id) })),
          ...savedLeads.filter((lead) => !serverIds.has(lead.id)),
        ]
        if (cancelled) return
        setRealtorId(tenantId)
        setLeads(mergedLeads)
        setError('')
      } catch (cause) {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os leads do CRM.')
        try {
          const savedLeads = parseLeads(window.localStorage.getItem(STORAGE_KEY))
          setLeads(savedLeads.filter((lead) => lead.realtorId === currentRealtorId))
        } catch (storageCause) {
          setError(
            storageCause instanceof Error
              ? storageCause.message
              : 'Não foi possível carregar os dados locais do CRM.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR')
    if (!query) return leads
    return leads.filter((lead) =>
      [lead.name, lead.email, lead.phone, lead.source]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(query)
    )
  }, [leads, search])

  const metrics = useMemo(
    () => ({
      total: leads.length,
      active: leads.filter((lead) => !['convertido', 'perdido'].includes(lead.status)).length,
      visits: leads.filter((lead) => lead.status === 'visita').length,
      converted: leads.filter((lead) => lead.status === 'convertido').length,
    }),
    [leads]
  )

  function persistLeads(nextLeads: CrmLead[]) {
    if (realtorId === null) return
    try {
      const allSavedLeads = parseLeads(window.localStorage.getItem(STORAGE_KEY))
      const otherRealtorLeads = allSavedLeads.filter((lead) => lead.realtorId !== realtorId)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...nextLeads, ...otherRealtorLeads]))
      setLeads(nextLeads)
      setError('')
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar as alterações do CRM.')
      setSuccess('')
      return false
    }
  }

  function createLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (realtorId === null) {
      setError('Não foi possível identificar a conta do corretor. Atualize a página e tente novamente.')
      return
    }
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    if (!name || (!email && !phone)) {
      setError('Informe o nome e pelo menos um meio de contato: e-mail ou telefone.')
      return
    }

    const lead: CrmLead = {
      id: `crm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      realtorId,
      name,
      email,
      phone,
      source: String(form.get('source') || '').trim() || 'Cadastro manual',
      status: 'novo',
      createdAt: new Date().toISOString(),
      notes: String(form.get('notes') || '').trim(),
    }
    if (persistLeads([lead, ...leads])) {
      event.currentTarget.reset()
      setSuccess('Lead adicionado ao funil do CRM.')
    }
  }

  function updateStage(leadId: string, status: LeadStage) {
    const nextLeads = leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    if (persistLeads(nextLeads)) setSuccess('Etapa do lead atualizada.')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'CRM' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">CRM</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize seus leads e acompanhe cada oportunidade até o fechamento.
            </p>
          </div>
          <a
            href="#novo-lead"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Novo lead
          </a>
        </header>

        {error ? <Alert variant="destructive" title="Atenção" description={error} /> : null}
        {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}

        <section aria-label="Resumo do funil" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Leads na carteira', value: metrics.total },
            { label: 'Em andamento', value: metrics.active },
            { label: 'Visitas', value: metrics.visits },
            { label: 'Convertidos', value: metrics.converted },
          ].map((metric) => (
            <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
          ))}
        </section>

        <section id="novo-lead" className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Cadastrar lead</h2>
          <form onSubmit={createLead} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Input name="name" label="Nome" placeholder="Nome do contato" required />
            <Input name="phone" label="Telefone" type="tel" placeholder="(11) 99999-9999" />
            <Input name="email" label="E-mail" type="email" placeholder="contato@email.com" />
            <Input name="source" label="Origem" placeholder="Indicação, site..." />
            <Input name="notes" label="Próximo passo / observação" placeholder="Ligar amanhã..." />
            <div className="sm:col-span-2 xl:col-span-5">
              <Button type="submit" disabled={loading || realtorId === null}>
                Adicionar ao funil
              </Button>
            </div>
          </form>
        </section>

        <section aria-label="Funil de vendas" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Etapas do funil</h2>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Buscar lead"
                className="pl-9"
                placeholder="Buscar nome, contato ou origem"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando leads...</p>
          ) : visibleLeads.length === 0 ? (
            <EmptyState
              title={search ? 'Nenhum lead encontrado' : 'Seu funil está vazio'}
              description={
                search
                  ? 'Tente buscar por outro nome, contato ou origem.'
                  : 'Cadastre um lead acima ou receba contatos pelo seu site para começar.'
              }
            />
          ) : (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 md:mx-0 md:px-0">
              {stages.map((stage) => {
                const stageLeads = visibleLeads.filter((lead) => lead.status === stage.id)
                return (
                  <section
                    key={stage.id}
                    aria-label={`${stage.label}: ${stageLeads.length} leads`}
                    className="w-[min(82vw,280px)] shrink-0 rounded-xl border border-border bg-muted/30 p-3 md:w-64"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {stageLeads.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {stageLeads.map((lead) => (
                        <article key={lead.id} className="space-y-3 rounded-lg border border-border bg-card p-3">
                          <div>
                            <h4 className="font-medium text-foreground">{lead.name}</h4>
                            <p className="mt-1 text-xs text-muted-foreground">{lead.source}</p>
                          </div>
                          {lead.phone ? (
                            <a className="block break-all text-xs text-primary hover:underline" href={`tel:${lead.phone}`}>
                              {lead.phone}
                            </a>
                          ) : null}
                          {lead.email ? (
                            <a className="block break-all text-xs text-primary hover:underline" href={`mailto:${lead.email}`}>
                              {lead.email}
                            </a>
                          ) : null}
                          {lead.notes ? <p className="text-xs text-muted-foreground">{lead.notes}</p> : null}
                          <label className="block text-xs font-medium text-muted-foreground">
                            Mover para
                            <select
                              aria-label={`Etapa de ${lead.name}`}
                              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
                              value={lead.status}
                              onChange={(event) => {
                                if (isLeadStage(event.target.value)) updateStage(lead.id, event.target.value)
                              }}
                            >
                              {stages.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </article>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
