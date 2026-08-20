'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  MeuSiteSettings,
  getMeuSiteSettings,
  saveMeuSiteSettings,
} from '@/lib/meu-site-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'

export default function MeuSitePersonalizarPage() {
  const [form, setForm] = useState<MeuSiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(getMeuSiteSettings(getCurrentRealtorId()))
  }, [])

  if (!form) return null

  const save = () => {
    saveMeuSiteSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Personalizar' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 pb-28 md:p-6">
        <MeuSiteNav />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalizar Meu Site</h1>
          <p className="text-sm text-muted-foreground">
            Foto, capa, textos, CRECI, WhatsApp e redes — modelo padrão da assinatura.
          </p>
        </div>
        {saved ? <Alert variant="success" description="Alterações salvas localmente." /> : null}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <Input label="Título principal (hero)" value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
          <Textarea label="Texto de apoio" rows={3} value={form.heroText} onChange={(e) => setForm({ ...form, heroText: e.target.value })} />
          <Textarea label="Biografia" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input label="CRECI" value={form.creci} onChange={(e) => setForm({ ...form, creci: e.target.value })} />
          <Input label="WhatsApp (DDI+DDD+número)" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          <Input label="URL da foto" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
          <Input label="URL da capa" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <Input
            label="Especialidades (separadas por vírgula)"
            value={form.specialties.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                specialties: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
          />
          <Input
            label="Regiões (separadas por vírgula)"
            value={form.regions.join(', ')}
            onChange={(e) =>
              setForm({
                ...form,
                regions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
              })
            }
          />
          <Input
            label="Instagram"
            value={form.social.instagram}
            onChange={(e) => setForm({ ...form, social: { ...form.social, instagram: e.target.value } })}
          />
          <Input
            label="Facebook"
            value={form.social.facebook}
            onChange={(e) => setForm({ ...form, social: { ...form.social, facebook: e.target.value } })}
          />
          <Input
            label="LinkedIn"
            value={form.social.linkedin}
            onChange={(e) => setForm({ ...form, social: { ...form.social, linkedin: e.target.value } })}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={save}>Salvar</Button>
            <Link href="/meu-site">
              <Button variant="outline">Voltar</Button>
            </Link>
            <Link href={`/${form.slug}`} target="_blank">
              <Button variant="secondary">Pré-visualizar</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
