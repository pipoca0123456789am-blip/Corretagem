'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'

const members = [
  { name: 'Você (titular)', role: 'Corretor', status: 'Ativo' },
  { name: 'Assistente comercial', role: 'Usuário adicional', status: 'Pendente' },
]

export default function TeamPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Equipe' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Equipe</h1>
          <p className="text-sm text-muted-foreground">Usuários da sua conta — limites conforme o plano</p>
        </div>
        <Alert
          variant="info"
          description="Para incluir usuários extras, use Solicitações → Usuário adicional ou veja os limites em Planos."
        />
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-semibold text-foreground">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </div>
              <Badge variant={m.status === 'Ativo' ? 'success' : 'warning'}>{m.status}</Badge>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/solicitacoes/nova"><Button>Solicitar usuário</Button></Link>
          <Link href="/plans"><Button variant="outline">Ver planos</Button></Link>
        </div>
      </div>
    </div>
  )
}
