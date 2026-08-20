'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getSiteAnalytics, getSiteLeads } from '@/lib/meu-site-data'
import { getActiveBrokerTemplate, getTemplateHistory } from '@/lib/template-marketplace-data'

export default function MeuSiteMetricsPage() {
  const [analytics, setAnalytics] = useState(getSiteAnalytics(1))
  const [leads, setLeads] = useState(0)
  const [templateName, setTemplateName] = useState('Meu Site básico')
  const [history, setHistory] = useState<{ id: string; label: string; at: string }[]>([])

  useEffect(() => {
    const id = getCurrentRealtorId() ?? 1
    setAnalytics(getSiteAnalytics(id))
    setLeads(getSiteLeads(id).length)
    const active = getActiveBrokerTemplate(id)
    setTemplateName(active?.template.name || 'Meu Site básico')
    setHistory(getTemplateHistory(id))
  }, [])

  const conversion =
    analytics.views > 0 ? Math.round((analytics.leads / analytics.views) * 1000) / 10 : 0

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Métricas' },
        ]}
      />
      <div className="space-y-6 p-4 pb-28 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Métricas do site</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Desempenho do template atual: <strong>{templateName}</strong>
          </p>
        </div>
        <MeuSiteNav />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Visualizações" value={analytics.views} description="Página pública" />
          <MetricCard title="Leads" value={analytics.leads} description="Formulários / captação" />
          <MetricCard title="Cadastros" value={analytics.signups} description="Área do cliente" />
          <MetricCard title="Conversão" value={`${conversion}%`} description="Leads / views" />
        </div>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Imóveis mais acessados</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {analytics.propertyViews.length === 0 ? (
              <li className="text-muted-foreground">Sem dados ainda.</li>
            ) : (
              analytics.propertyViews.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate">{p.title}</span>
                  <span className="text-muted-foreground">{p.views}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Histórico do template</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {history.length === 0 ? (
              <li className="text-muted-foreground">Sem eventos de template.</li>
            ) : (
              history.slice(0, 12).map((h) => (
                <li key={h.id} className="flex flex-col gap-0.5 border-b border-border/50 py-2 sm:flex-row sm:justify-between">
                  <span>{h.label}</span>
                  <span className="text-xs text-muted-foreground">{h.at.slice(0, 19).replace('T', ' ')}</span>
                </li>
              ))
            )}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Leads listados no CRM: {leads}</p>
        </section>
      </div>
    </div>
  )
}
