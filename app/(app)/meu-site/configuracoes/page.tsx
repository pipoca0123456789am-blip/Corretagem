'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { MeuSiteSettings, getMeuSiteSettings, saveMeuSiteSettings, slugifyTitle } from '@/lib/meu-site-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { revertToBasicSite } from '@/lib/template-marketplace-data'

export default function MeuSiteConfigPage() {
  const [form, setForm] = useState<MeuSiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(getMeuSiteSettings(getCurrentRealtorId()))
  }, [])

  if (!form) return null

  const save = () => {
    const next = { ...form, slug: slugifyTitle(form.slug) || form.slug }
    saveMeuSiteSettings(next)
    setForm(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Configurações' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 pb-28 md:p-6">
        <MeuSiteNav />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações do site</h1>
          <p className="text-sm text-muted-foreground">Slug, SEO e permissões da vitrine automática.</p>
        </div>
        {saved ? <Alert variant="success" description="Configurações salvas." /> : null}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            hint={`Seu site: /${slugifyTitle(form.slug) || form.slug}`}
          />
          <Input label="SEO — título" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          <Input
            label="SEO — descrição"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
          <Checkbox
            checked={form.active}
            onCheckedChange={(v) => setForm({ ...form, active: !!v })}
            label="Página ativa"
          />
          <Checkbox
            checked={form.showAddress}
            onCheckedChange={(v) => setForm({ ...form, showAddress: !!v })}
            label="Mostrar endereço"
          />
          <Checkbox
            checked={form.showPrices}
            onCheckedChange={(v) => setForm({ ...form, showPrices: !!v })}
            label="Mostrar valores"
          />
          <Checkbox
            checked={form.allowSignup}
            onCheckedChange={(v) => setForm({ ...form, allowSignup: !!v })}
            label="Permitir cadastro"
          />
          <Checkbox
            checked={form.allowProposal}
            onCheckedChange={(v) => setForm({ ...form, allowProposal: !!v })}
            label="Permitir proposta"
          />
          <Checkbox
            checked={form.allowVisit}
            onCheckedChange={(v) => setForm({ ...form, allowVisit: !!v })}
            label="Permitir visita"
          />
          <Checkbox
            checked={form.allowWhatsApp}
            onCheckedChange={(v) => setForm({ ...form, allowWhatsApp: !!v })}
            label="Permitir WhatsApp"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>Salvar</Button>
            <Button
              variant="outline"
              onClick={() => {
                revertToBasicSite()
                setSaved(true)
                setTimeout(() => setSaved(false), 2500)
              }}
            >
              Voltar para Meu Site básico
            </Button>
            <Link href="/meu-site">
              <Button variant="tertiary">Voltar</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
