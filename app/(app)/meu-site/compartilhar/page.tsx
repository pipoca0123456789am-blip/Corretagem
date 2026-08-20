'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  copyToClipboard,
  getMeuSiteSettings,
  getSitePublicUrl,
  whatsappShareUrl,
} from '@/lib/meu-site-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getRealtorProperties } from '@/lib/phase9-data'

export default function MeuSiteSharePage() {
  const [slug, setSlug] = useState('')
  const [realtorId, setRealtorId] = useState(1)
  const [msg, setMsg] = useState('')
  const siteUrl = slug ? getSitePublicUrl(slug) : ''

  useEffect(() => {
    const id = getCurrentRealtorId() ?? 1
    setRealtorId(id)
    setSlug(getMeuSiteSettings(id).slug)
  }, [])

  const properties = useMemo(() => getRealtorProperties(realtorId).slice(0, 6), [realtorId])
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(siteUrl || 'https://local')}`

  const copy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text)
      setMsg(label)
    } catch {
      setMsg('Não foi possível copiar')
    }
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Compartilhar' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compartilhar Meu Site</h1>
          <p className="text-sm text-muted-foreground">Links, WhatsApp, redes e QR Code.</p>
        </div>
        {msg ? <Alert variant="success" description={msg} onClose={() => setMsg('')} /> : null}

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Site completo</h2>
          <p className="mt-1 break-all text-sm text-muted-foreground">{siteUrl}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => copy(siteUrl, 'Link do site copiado')}>
              Copiar link
            </Button>
            <a href={whatsappShareUrl(`Olá! Confira meus imóveis: ${siteUrl}`)} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline">
                WhatsApp
              </Button>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="outline">
                Facebook
              </Button>
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copy(siteUrl, 'Link pronto para colar no Instagram')}
            >
              Instagram (copiar)
            </Button>
          </div>
          <img src={qrSrc} alt="QR" className="mt-6 h-40 w-40 rounded-lg border border-border bg-white p-2" />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">Links de imóveis</h2>
          <ul className="space-y-3">
            {properties.map((p) => {
              const url = getSitePublicUrl(slug, `/imovel/${p.slug}`)
              return (
                <li key={p.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="break-all text-xs text-muted-foreground">{url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(url, `Link de ${p.title} copiado`)}>
                      Copiar
                    </Button>
                    <a href={whatsappShareUrl(`Imóvel: ${p.title} — ${url}`)} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        WhatsApp
                      </Button>
                    </a>
                    <Link href={url} target="_blank">
                      <Button size="sm">Abrir</Button>
                    </Link>
                  </div>
                </li>
              )
            })}
            {properties.length === 0 ? (
              <li className="text-sm text-muted-foreground">Nenhum imóvel publicado no site.</li>
            ) : null}
          </ul>
        </section>

        <Link href="/meu-site">
          <Button variant="outline">Voltar ao Meu Site</Button>
        </Link>
      </div>
    </div>
  )
}
