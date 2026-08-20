'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getEffectivePlanId } from '@/lib/phase14-data'
import {
  PageTemplate,
  TemplateCategory,
  badgeLabels,
  formatBRL,
  getActiveBrokerTemplate,
  getActiveTemplates,
  getMarketplaceConfig,
  getTemplatePrice,
  getTemplateDuration,
  loadCategories,
  revertToBasicSite,
  trackTemplateEvent,
} from '@/lib/template-marketplace-data'

function TemplatesGalleryInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [templates, setTemplates] = useState<PageTemplate[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const cfg = getMarketplaceConfig()
  const planId = getEffectivePlanId()

  useEffect(() => {
    setTemplates(getActiveTemplates())
    setCategories(loadCategories().filter((c) => c.active))
    const active = getActiveBrokerTemplate(getCurrentRealtorId())
    setActiveId(active?.template.id || null)
    trackTemplateEvent('template_gallery_view', { realtorId: getCurrentRealtorId() ?? 1 })

    if (searchParams.get('action') === 'basic') {
      revertToBasicSite()
      setActiveId(null)
      setMsg('Página retornou ao Meu Site básico. Personalizações preservadas.')
      router.replace('/meu-site/templates')
    }
  }, [searchParams, router])

  const filtered = useMemo(() => {
    let list = [...templates]
    if (category !== 'all') list = list.filter((t) => t.categoryId === category)
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          t.style.toLowerCase().includes(s) ||
          t.slug.includes(s)
      )
    }
    if (sort === 'price') list.sort((a, b) => getTemplatePrice(a) - getTemplatePrice(b))
    else if (sort === 'recent') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => Number(b.featured) - Number(a.featured))
    return list
  }, [templates, category, q, sort])

  const catName = (id: string) => categories.find((c) => c.id === id)?.name || id

  const planOk = (t: PageTemplate) => {
    if (t.supportedPlans.includes('all')) return true
    return t.supportedPlans.includes(planId as 'essencial' | 'profissional' | 'premium')
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Templates' },
        ]}
      />
      <div className="space-y-6 p-4 pb-28 md:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Produto complementar</p>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Templates profissionais</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {formatBRL(cfg.templatePrice)} por {cfg.templateDurationMonths} meses · Imóveis e CRM automáticos · Não
            substitui o Meu Site básico nem a Página Premium (R$ 497).
          </p>
        </div>

        <MeuSiteNav />

        {msg ? <Alert variant="success" description={msg} /> : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Buscar template…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'all', label: 'Todas as categorias' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={[
              { value: 'featured', label: 'Destaques' },
              { value: 'recent', label: 'Mais recentes' },
              { value: 'price', label: 'Menor preço' },
              { value: 'name', label: 'Nome A–Z' },
            ]}
          />
          <div className="flex items-center text-sm text-muted-foreground">
            {filtered.length} template(s) ativo(s)
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['recomendado', 'mais_escolhido', 'exclusivo', 'novo'].map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="outline"
              onClick={() =>
                setTemplates(
                  getActiveTemplates().filter((t) => t.badge === tag || (tag === 'recomendado' && t.featured))
                )
              }
            >
              {badgeLabels[tag as keyof typeof badgeLabels] || tag}
            </Button>
          ))}
          <Button size="sm" variant="tertiary" onClick={() => setTemplates(getActiveTemplates())}>
            Limpar filtros rápidos
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => {
            const price = getTemplatePrice(t)
            const duration = getTemplateDuration(t)
            const eligible = planOk(t)
            const isCurrent = activeId === t.id
            return (
              <article
                key={t.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                onMouseEnter={() =>
                  trackTemplateEvent('template_card_view', {
                    templateId: t.id,
                    realtorId: getCurrentRealtorId() ?? 1,
                  })
                }
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img src={t.thumbnail} alt="" className="h-full w-full object-cover" />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {t.badge ? <Badge variant="secondary">{badgeLabels[t.badge]}</Badge> : null}
                    {isCurrent ? <Badge variant="success">Atual</Badge> : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h2 className="font-semibold text-foreground">{t.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {t.slug} · {catName(t.categoryId)} · {t.style}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {t.features.slice(0, 3).map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {t.responsive ? <Badge variant="secondary">Responsivo</Badge> : null}
                    {t.desktopReady ? <Badge variant="secondary">Desktop</Badge> : null}
                    {t.mobileReady ? <Badge variant="secondary">Mobile</Badge> : null}
                    {t.exclusive ? <Badge variant="warning">Exclusivo</Badge> : null}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatBRL(price)}{' '}
                    <span className="font-normal text-muted-foreground">/ {duration} meses</span>
                  </p>
                  {!eligible ? (
                    <Alert variant="warning" description="Disponível em planos superiores." />
                  ) : null}
                  <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Link href={`/meu-site/templates/${t.slug}`}>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto">
                        Visualizar demonstração
                      </Button>
                    </Link>
                    <Link href={`/meu-site/templates/${t.slug}?view=mobile`}>
                      <Button size="sm" variant="tertiary" className="w-full sm:w-auto">
                        Ver no celular
                      </Button>
                    </Link>
                    <Link href={eligible ? `/meu-site/templates/checkout?template=${t.id}` : '/assinatura'}>
                      <Button size="sm" className="w-full sm:w-auto" disabled={!eligible && !isCurrent}>
                        {isCurrent ? 'Renovar / gerenciar' : 'Escolher template'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <Alert variant="info" description="Nenhum template encontrado com esses filtros." />
        ) : null}
      </div>
    </div>
  )
}

export default function TemplatesGalleryPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando galeria…</div>}>
      <TemplatesGalleryInner />
    </Suspense>
  )
}
