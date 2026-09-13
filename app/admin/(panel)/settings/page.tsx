'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/paineladmin' }, { label: 'Configurações' }]} />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Configurações da plataforma</h1>
          <p className="text-sm text-muted-foreground">Preferências simuladas do Super Admin</p>
        </div>
        {saved ? <Alert variant="success" description="Configurações salvas localmente (simulado)." onClose={() => setSaved(false)} /> : null}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Preços de planos provisórios</Badge>
            <Badge variant="warning">Página profissional R$ 497</Badge>
            <Badge variant="secondary">IA R$ 97 sugerido</Badge>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm font-medium text-foreground">Segurança — 2FA TOTP</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Configure autenticador para Super Admin antes de produção.
            </p>
            <Button className="mt-3" variant="outline" onClick={() => (window.location.href = '/admin/security/2fa')}>
              Abrir configuração 2FA
            </Button>
          </div>
          <Input label="Nome da plataforma" defaultValue="ImóvelHub" />
          <Input label="E-mail de suporte" defaultValue="suporte@imovel.hub" />
          <Select
            label="Idioma padrão"
            options={[
              { value: 'pt-BR', label: 'Português (Brasil)' },
              { value: 'en', label: 'English' },
            ]}
            defaultValue="pt-BR"
          />
          <Select
            label="Moeda"
            options={[{ value: 'BRL', label: 'Real (R$)' }]}
            defaultValue="BRL"
          />
          <Button onClick={() => setSaved(true)}>Salvar</Button>
        </div>
      </div>
    </div>
  )
}
