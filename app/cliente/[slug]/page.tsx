'use client'

import Link from 'next/link'
import { CalendarDays, Heart, MessageSquare, Sparkles } from 'lucide-react'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { ClientPropertyGrid } from '@/components/client-portal/property-actions'
import {
  getFavoriteIds,
  getCompareIds,
  getViewedIds,
} from '@/lib/client-auth'
import {
  getClientMessages,
  getClientVisits,
  getNewProperties,
  matchProperties,
} from '@/lib/phase11-data'

export default function ClientDashboardPage() {
  const { slug, profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()

  if (!profile) return null
  const base = `/cliente/${slug}`
  const recommended = matchProperties(profile.id).slice(0, 3)
  const news = getNewProperties(profile.id).slice(0, 2)
  const visits = getClientVisits(profile.id)
  const unread = getClientMessages(profile.firstName).filter((m) => !m.read).length

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Painel</h1>
          <p className="text-sm text-muted-foreground">
            Tudo o que importa na carteira de {profile.firstName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${base}/preferencias`}>
            <Button variant="outline">Atualizar preferências</Button>
          </Link>
          <Link href={`${base}/meu-corretor`}>
            <Button>Falar com o corretor</Button>
          </Link>
        </div>
      </div>

      <PageState state={state} onRetry={reload}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Recomendados" value={recommended.length} icon={<Sparkles className="h-5 w-5" />} />
          <MetricCard title="Favoritos" value={getFavoriteIds().length} icon={<Heart className="h-5 w-5" />} />
          <MetricCard title="Visitas" value={visits.length} icon={<CalendarDays className="h-5 w-5" />} />
          <MetricCard title="Mensagens novas" value={unread} icon={<MessageSquare className="h-5 w-5" />} />
        </div>

        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Imóveis recomendados</h2>
            <Link href={`${base}/recomendados`} className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          {recommended.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete ou atualize suas preferências.</p>
          ) : (
            <ClientPropertyGrid properties={recommended} profile={profile} showDiscard />
          )}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground">Novos imóveis</h3>
            <ul className="mt-3 space-y-2">
              {news.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">{p.title}</span>
                  <Badge variant="info">Novo</Badge>
                </li>
              ))}
            </ul>
            <Link href={`${base}/novos`} className="mt-4 inline-block text-sm text-primary hover:underline">
              Abrir lista
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground">Resumo rápido</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Comparação: {getCompareIds().length}/3</li>
              <li>Visualizados: {getViewedIds().length}</li>
              <li>Próxima visita: {visits[0] ? `${visits[0].date} às ${visits[0].time}` : 'Nenhuma'}</li>
            </ul>
          </div>
        </section>
      </PageState>
    </div>
  )
}
