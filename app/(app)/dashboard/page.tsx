'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { Badge } from '@/components/design-system/feedback/badge'
import { Button } from '@/components/design-system/buttons/button'
import { Alert } from '@/components/design-system/feedback/alert'
import { correctorMetrics } from '@/lib/mock-data'

export default function DashboardPage() {
  const upsellProducts = [
    {
      id: 1,
      title: 'Página Profissional Premium',
      description: 'Crie uma página profissional para atrair mais clientes',
      price: 'R$ 497',
      features: ['Design premium', 'SEO otimizado', 'WhatsApp integrado'],
      href: '/professional',
      cta: 'Contratar por R$ 497',
    },
    {
      id: 2,
      title: 'IA + WhatsApp',
      description: 'Automatize respostas com agente isolado da sua carteira',
      price: 'R$ 97',
      features: ['Respostas automáticas', 'Transferência humana', 'Relatórios'],
      href: '/ai',
      cta: 'Contratar IA por R$ 97',
    },
    {
      id: 3,
      title: 'Upgrade de plano',
      description: 'Compare planos e ajuste limites da operação',
      price: 'R$ 149,90/mês (provisório)',
      features: ['Mais imóveis', 'Mais usuários', 'Relatórios'],
      href: '/plans',
      cta: 'Ver planos',
    },
  ]

  const recentProperties = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
      title: 'Apartamento Luxo Zona Sul',
      location: 'Zona Sul, São Paulo - SP',
      price: 850000,
      area: 180,
      beds: 3,
      baths: 2,
      status: 'available' as const,
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop',
      title: 'Casa Jardim Europa',
      location: 'Jardim Europa, São Paulo - SP',
      price: 2400000,
      area: 320,
      beds: 4,
      baths: 3,
      status: 'pending' as const,
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1512917774080-9b274b3f0df0?w=300&h=200&fit=crop',
      title: 'Cobertura Zona Nobre',
      location: 'Moema, São Paulo - SP',
      price: 1200000,
      area: 300,
      beds: 4,
      baths: 4,
      status: 'sold' as const,
    },
  ]

  const quickActions = [
    { label: 'Novo Imóvel', href: '/properties/create' },
    { label: 'Clientes', href: '/clients' },
    { label: 'Agenda', href: '/agenda' },
    { label: 'Documentos', href: '/documents' },
    { label: 'Relatórios', href: '/reports' },
    { label: 'Ajuda', href: '/help' },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Bem-vindo ao ImóvelHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Resumo do seu desempenho e oportunidades</p>
        </div>

        <Alert
          variant="info"
          description="Demonstração com dados fictícios. Sua carteira permanece isolada — sem concorrência interna."
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Imóveis ativos"
            value={correctorMetrics.properties.active}
            description={`de ${correctorMetrics.properties.total} cadastrados`}
          />
          <MetricCard
            title="Vendas fechadas"
            value={correctorMetrics.sales.closed}
            description={`Conversão: ${correctorMetrics.sales.conversion}`}
          />
          <MetricCard
            title="Leads qualificados"
            value={correctorMetrics.leads.qualified}
            description={`Novos: ${correctorMetrics.leads.new}`}
          />
          <MetricCard
            title="Receita do mês"
            value={correctorMetrics.revenue.thisMonth}
            description={`YTD: ${correctorMetrics.revenue.ytd}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-lg border border-border bg-card p-4 text-center transition-colors hover:bg-muted"
            >
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">Maximize seu potencial</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {upsellProducts.map((product) => (
              <div key={product.id} className="rounded-xl border border-border bg-card p-5">
                <Badge variant="primary">{product.price}</Badge>
                <h3 className="mt-3 text-lg font-bold text-foreground">{product.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {product.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <Link href={product.href} className="mt-4 block">
                  <Button className="w-full">{product.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground">Imóveis recentes</h2>
            <Link href="/properties">
              <Button variant="outline" size="sm">
                Ver tudo
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentProperties.map((prop) => (
              <Link key={prop.id} href={`/properties/${prop.id}`}>
                <PropertyCard {...prop} />
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xl font-bold text-foreground">Atividade recente</h2>
          <div className="space-y-3">
            {[
              { time: '2 horas atrás', action: 'Lead qualificado: Ana Souza', href: '/clients' },
              { time: '4 horas atrás', action: 'Resposta no chamado de pagamento', href: '/help/chamados' },
              { time: '1 dia atrás', action: 'Visita confirmada na agenda', href: '/agenda' },
            ].map((activity) => (
              <Link
                key={activity.action}
                href={activity.href}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
              >
                <p className="text-sm text-foreground">{activity.action}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
