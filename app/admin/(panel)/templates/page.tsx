'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import {
  PageTemplate,
  TemplateCategory,
  formatBRL,
  getMarketplaceConfig,
  loadCategories,
  loadTemplateSubscriptions,
  loadTemplates,
  saveCategories,
  saveMarketplaceConfig,
  saveTemplates,
  activateTemplateSubscription,
} from '@/lib/template-marketplace-data'

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [subs, setSubs] = useState(loadTemplateSubscriptions())
  const [price, setPrice] = useState(String(getMarketplaceConfig().templatePrice))
  const [duration, setDuration] = useState(String(getMarketplaceConfig().templateDurationMonths))
  const [domainFee, setDomainFee] = useState(String(getMarketplaceConfig().domainServiceFeeFrom))
  const [msg, setMsg] = useState('')

  const refresh = () => {
    setTemplates(loadTemplates())
    setCategories(loadCategories())
    setSubs(loadTemplateSubscriptions())
    const cfg = getMarketplaceConfig()
    setPrice(String(cfg.templatePrice))
    setDuration(String(cfg.templateDurationMonths))
    setDomainFee(String(cfg.domainServiceFeeFrom))
  }

  useEffect(() => {
    refresh()
  }, [])

  const savePrices = () => {
    saveMarketplaceConfig({
      templatePrice: Number(price) || 97,
      templateDurationMonths: Number(duration) || 2,
      domainServiceFeeFrom: Number(domainFee) || 69.9,
    })
    setMsg('Preços atualizados (configuráveis — não hardcoded no checkout).')
    refresh()
  }

  const setStatus = (id: string, status: PageTemplate['status']) => {
    const list = loadTemplates().map((t) => (t.id === id ? { ...t, status, updatedAt: new Date().toISOString().slice(0, 10) } : t))
    saveTemplates(list)
    refresh()
  }

  const toggleCategory = (id: string) => {
    const list = loadCategories().map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    saveCategories(list)
    refresh()
  }

  const confirmSub = (id: string) => {
    activateTemplateSubscription(id)
    setMsg(`Assinatura ${id} ativada.`)
    refresh()
  }

  const activeCount = templates.filter((t) => t.status === 'active').length
  const paidSubs = subs.filter((s) => s.status === 'active' || s.status === 'expiring').length

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Marketplace de templates' },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold text-white">Templates profissionais</h1>
        <p className="mt-1 text-sm text-slate-400">
          Catálogo, preços, categorias e contratações. Página Premium (R$ 497) permanece em outro módulo.
        </p>
      </div>

      {msg ? <Alert variant="success" description={msg} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Templates ativos" value={activeCount} description="Publicados" />
        <MetricCard title="Contratações ativas" value={paidSubs} description="Corretores" />
        <MetricCard title="Pedidos" value={subs.length} description="Histórico local" />
        <MetricCard title="Categorias" value={categories.filter((c) => c.active).length} description="Ativas" />
      </div>

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-4">
        <h2 className="font-semibold text-white">Preços oficiais</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Template (R$)" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input label="Validade (meses)" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Input label="Taxa domínio a partir de (R$)" value={domainFee} onChange={(e) => setDomainFee(e.target.value)} />
        </div>
        <Button onClick={savePrices}>Salvar configuração</Button>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
        <h2 className="mb-3 font-semibold text-white">Categorias</h2>
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Button size="sm" variant={c.active ? 'primary' : 'outline'} onClick={() => toggleCategory(c.id)}>
                {c.name} {c.active ? '' : '(off)'}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 overflow-x-auto">
        <h2 className="mb-3 font-semibold text-white">Catálogo</h2>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="py-2 pr-2">Nome</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2">Preço</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-slate-800">
                <td className="py-3 pr-2">
                  <p className="font-medium text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.slug}</p>
                </td>
                <td className="py-3 pr-2">
                  <Badge variant="secondary">{t.status}</Badge>
                </td>
                <td className="py-3 pr-2 text-slate-300">
                  {formatBRL(t.basePrice ?? Number(price))}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    <Select
                      value={t.status}
                      onChange={(e) => setStatus(t.id, e.target.value as PageTemplate['status'])}
                      options={[
                        { value: 'draft', label: 'draft' },
                        { value: 'review', label: 'review' },
                        { value: 'active', label: 'active' },
                        { value: 'paused', label: 'paused' },
                        { value: 'deprecated', label: 'deprecated' },
                        { value: 'archived', label: 'archived' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 overflow-x-auto">
        <h2 className="mb-3 font-semibold text-white">Contratações</h2>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="py-2">Corretor</th>
              <th className="py-2">Template</th>
              <th className="py-2">Status</th>
              <th className="py-2">Valor</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-slate-500">
                  Nenhuma contratação ainda.
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s.id} className="border-b border-slate-800">
                  <td className="py-3">#{s.realtorId}</td>
                  <td className="py-3">{s.templateId}</td>
                  <td className="py-3">
                    <Badge variant="secondary">{s.status}</Badge>
                  </td>
                  <td className="py-3">{formatBRL(s.price)}</td>
                  <td className="py-3">
                    {s.status === 'payment_pending' || s.status === 'checkout_started' || s.status === 'payment_confirmed' ? (
                      <Button size="sm" onClick={() => confirmSub(s.id)}>
                        Ativar manualmente
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
