'use client'

import { useEffect, useMemo, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { getAllSiteLeads, type SiteLead } from '@/lib/meu-site-data'
import {
  accessLogActionLabels,
  clearAccessLogs,
  getAccessLogs,
  type AccessLogEntry,
} from '@/lib/access-logs'
import { publicRealtorProfiles } from '@/lib/phase9-data'
import { isSuperAdmin } from '@/lib/auth'

type Tab = 'leads' | 'logs'

function formatAt(iso: string) {
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}

function realtorLabel(id: number) {
  return publicRealtorProfiles.find((p) => p.id === id)?.name || `#${id}`
}

export default function AdminLeadsPage() {
  const [allowed, setAllowed] = useState(false)
  const [tab, setTab] = useState<Tab>('leads')
  const [q, setQ] = useState('')
  const [leads, setLeads] = useState<SiteLead[]>([])
  const [logs, setLogs] = useState<AccessLogEntry[]>([])

  const refresh = () => {
    setLeads(getAllSiteLeads())
    setLogs(getAccessLogs(300))
  }

  useEffect(() => {
    if (!isSuperAdmin()) {
      window.location.href = '/admin/acesso-negado'
      return
    }
    setAllowed(true)
    refresh()
  }, [])

  const filteredLeads = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return leads
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.email.toLowerCase().includes(term) ||
        l.phone.includes(term) ||
        l.source.toLowerCase().includes(term) ||
        realtorLabel(l.realtorId).toLowerCase().includes(term)
    )
  }, [leads, q])

  const filteredLogs = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return logs
    return logs.filter(
      (l) =>
        (l.leadName || '').toLowerCase().includes(term) ||
        (l.leadEmail || '').toLowerCase().includes(term) ||
        (l.leadPhone || '').includes(term) ||
        l.realtorName.toLowerCase().includes(term) ||
        l.path.toLowerCase().includes(term) ||
        l.source.toLowerCase().includes(term) ||
        accessLogActionLabels[l.action].toLowerCase().includes(term)
    )
  }, [logs, q])

  if (!allowed) return null

  const leadSubmits = logs.filter((l) => l.action === 'lead_submit').length
  const siteViews = logs.filter((l) => l.action === 'site_view').length

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/paineladmin' }, { label: 'Leads e acessos' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Leads e logs de acesso</h1>
            <p className="text-sm text-muted-foreground">
              Visão global de capturas e trilhas de navegação nas vitrines públicas
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Limpar todos os logs de acesso deste navegador?')) {
                  clearAccessLogs()
                  refresh()
                }
              }}
            >
              Limpar logs
            </Button>
          </div>
        </div>

        <Alert
          variant="info"
          title="Protótipo local"
          description="Logs ficam no localStorage deste browser. Em produção, devem ser gravados em servidor com retenção e IP real."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard title="Leads capturados" value={leads.length} />
          <MetricCard title="Eventos de acesso" value={logs.length} />
          <MetricCard title="Visitas / leads (log)" value={`${siteViews} / ${leadSubmits}`} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={tab === 'leads' ? 'primary' : 'outline'} onClick={() => setTab('leads')}>
            Todos os leads
          </Button>
          <Button size="sm" variant={tab === 'logs' ? 'primary' : 'outline'} onClick={() => setTab('logs')}>
            Logs de acesso
          </Button>
        </div>

        <Input
          placeholder="Buscar por nome, e-mail, telefone, corretor, rota ou origem…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {tab === 'leads' ? (
          filteredLeads.length === 0 ? (
            <EmptyState
              title="Nenhum lead ainda"
              description="Quando um visitante preencher formulários nas vitrines, o lead aparece aqui."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Quando</th>
                    <th className="px-3 py-2">Lead</th>
                    <th className="px-3 py-2">Contato</th>
                    <th className="px-3 py-2">Corretor</th>
                    <th className="px-3 py-2">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="border-b border-border/70">
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatAt(l.createdAt)}</td>
                      <td className="px-3 py-2 font-medium text-foreground">{l.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <div>{l.email}</div>
                        <div>{l.phone}</div>
                      </td>
                      <td className="px-3 py-2">{realtorLabel(l.realtorId)}</td>
                      <td className="px-3 py-2">
                        <Badge variant="info">{l.source}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="Nenhum log de acesso"
            description="Visitas às vitrines e envios de lead geram eventos automaticamente."
          />
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      log.action === 'lead_submit' || log.action === 'client_signup'
                        ? 'success'
                        : log.action.includes('login')
                          ? 'warning'
                          : 'info'
                    }
                  >
                    {accessLogActionLabels[log.action]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatAt(log.at)}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  <strong>{log.realtorName}</strong>
                  {log.leadName ? ` · ${log.leadName}` : ''}
                  {log.leadEmail ? ` · ${log.leadEmail}` : ''}
                  {log.leadPhone ? ` · ${log.leadPhone}` : ''}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rota: {log.path || '—'} · Origem: {log.source} · Ref: {log.referrer}
                </p>
                {log.detail ? (
                  <p className="mt-1 truncate text-xs text-muted-foreground">Detalhe: {log.detail}</p>
                ) : null}
                <p className="mt-1 truncate text-[10px] text-muted-foreground">{log.userAgent}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
