'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  TemplateRenderer,
  DEMO_PROFILE,
  DEMO_PROPERTIES,
} from '@/components/templates/template-renderer'
import {
  PageTemplate,
  badgeLabels,
  formatBRL,
  getTemplateBySlug,
  getTemplateDuration,
  getTemplatePrice,
  loadCategories,
  trackTemplateEvent,
} from '@/lib/template-marketplace-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'

type Viewport = 'desktop' | 'tablet' | 'mobile'

export default function TemplateDemoPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = String(params.slug)
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [viewport, setViewport] = useState<Viewport>(
    searchParams.get('view') === 'mobile' ? 'mobile' : 'desktop'
  )
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    const t = getTemplateBySlug(slug) || null
    setTemplate(t)
    if (t) {
      setCategoryName(loadCategories().find((c) => c.id === t.categoryId)?.name || '')
      trackTemplateEvent(
        viewport === 'mobile' ? 'template_mobile_preview' : 'template_demo_view',
        { templateId: t.id, realtorId: getCurrentRealtorId() ?? 1 }
      )
    }
  }, [slug, viewport])

  if (!template) {
    return (
      <div className="p-6">
        <Alert variant="destructive" title="Template não encontrado" description="Volte à galeria." />
        <Link href="/meu-site/templates" className="mt-4 inline-block">
          <Button>Voltar</Button>
        </Link>
      </div>
    )
  }

  const width =
    viewport === 'mobile' ? 'max-w-[390px]' : viewport === 'tablet' ? 'max-w-[768px]' : 'max-w-6xl'

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Templates', href: '/meu-site/templates' },
          { label: template.name },
        ]}
      />
      <div className="space-y-4 p-4 pb-28 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {template.badge ? <Badge variant="secondary">{badgeLabels[template.badge]}</Badge> : null}
              <Badge variant="info">{categoryName}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{template.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{template.description}</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {formatBRL(getTemplatePrice(template))} / {getTemplateDuration(template)} meses
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/meu-site/templates">
              <Button size="sm" variant="outline">
                Voltar
              </Button>
            </Link>
            <Link href={`/meu-site/templates/checkout?template=${template.id}`}>
              <Button size="sm">Escolher este template</Button>
            </Link>
          </div>
        </div>

        <Alert
          variant="warning"
          title="Demonstração isolada"
          description="Dados fictícios. Abrir esta prévia não altera sua página pública."
        />

        <div className="flex flex-wrap gap-2">
          {(['desktop', 'tablet', 'mobile'] as Viewport[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={viewport === v ? 'primary' : 'outline'}
              onClick={() => setViewport(v)}
            >
              {v === 'desktop' ? 'Desktop' : v === 'tablet' ? 'Tablet' : 'Celular'}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">Seções</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {template.sections.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">Recursos</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {template.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">Personalizações</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {template.customizationKeys.map((k) => (
                  <li key={k}>• {k}</li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-3 md:p-6">
            <div className={`mx-auto overflow-hidden rounded-lg border border-border shadow-lg ${width}`}>
              <TemplateRenderer
                template={template}
                profile={DEMO_PROFILE}
                properties={DEMO_PROPERTIES}
                demo
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
