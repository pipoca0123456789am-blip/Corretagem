'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getRealtorProperties } from '@/lib/phase9-data'
import {
  getMeuSiteSettings,
  getSitePublicUrl,
  copyToClipboard,
} from '@/lib/meu-site-data'

export default function MeuSitePropertiesPage() {
  const [slug, setSlug] = useState('')
  const [items, setItems] = useState<ReturnType<typeof getRealtorProperties>>([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const id = getCurrentRealtorId() ?? 1
    const settings = getMeuSiteSettings(id)
    setSlug(settings.slug)
    setItems(getRealtorProperties(id))
  }, [])

  const copy = async (url: string) => {
    await copyToClipboard(url)
    setMsg('Link copiado')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Meus Imóveis' },
        ]}
      />
      <div className="space-y-6 p-4 pb-28 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Imóveis no site</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Somente imóveis publicados da sua carteira. Templates consomem esta lista automaticamente.
          </p>
        </div>
        <MeuSiteNav />
        {msg ? <Alert variant="success" description={msg} /> : null}

        <ul className="space-y-3">
          {items.map((p) => {
            const url = `${getSitePublicUrl(slug).replace(/\/$/, '')}/imovel/${p.slug}`
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex gap-3">
                  <img src={p.image} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.neighborhood} · {p.city}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.featured ? <Badge variant="success">Destaque</Badge> : null}
                      <Badge variant="secondary">{p.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/corretor/${slug}/imovel/${p.slug}`} target="_blank">
                    <Button size="sm" variant="outline">
                      Ver página
                    </Button>
                  </Link>
                  <Button size="sm" variant="tertiary" onClick={() => copy(url)}>
                    Copiar link
                  </Button>
                  <Link href="/imoveis">
                    <Button size="sm" variant="outline">
                      Editar no painel
                    </Button>
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>

        {items.length === 0 ? (
          <Alert
            variant="info"
            description="Publique imóveis no painel para aparecerem no site e nos templates."
          />
        ) : null}
      </div>
    </div>
  )
}
