'use client'

import React, { useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { AgentCard } from '@/components/design-system/cards/agent-card'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { Tabs } from '@/components/design-system/navigation/tabs'
import {
  ArrowRight,
  Home,
  Palette,
  Grid3x3,
  Type,
  Zap,
  Shield,
  Layers,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const features = [
    {
      icon: Grid3x3,
      title: '20+ Componentes',
      description: 'Biblioteca completa de componentes reutilizáveis e bem documentados',
    },
    {
      icon: Palette,
      title: 'Paleta Premium',
      description: 'Sistema de cores sofisticado com tons terrosos e acentos de confiança',
    },
    {
      icon: Type,
      title: 'Tipografia Refinada',
      description: 'Escala tipográfica harmônica com escalas definidas para cada contexto',
    },
    {
      icon: Zap,
      title: '100% Responsivo',
      description: 'Mobile-first design que funciona perfeitamente em todos os dispositivos',
    },
    {
      icon: Shield,
      title: 'Acessível & WCAG',
      description: 'Conformidade com diretrizes de acessibilidade internacionais',
    },
    {
      icon: Layers,
      title: 'Design Tokens',
      description: 'Sistema de tokens centralizado para consistência em toda a plataforma',
    },
  ]

  const components = [
    { category: 'Formulários', items: ['Campo de texto', 'Caixa de seleção', 'Interruptor', 'Opção', 'Lista', 'Área de texto'] },
    { category: 'Botões', items: ['Primário', 'Secundário', 'Terciário', 'Perigo', 'Contorno', 'Carregando'] },
    { category: 'Cartões', items: ['Métrica', 'Imóvel', 'Corretor'] },
    { category: 'Navegação', items: ['Breadcrumbs', 'Abas', 'Paginação'] },
    { category: 'Feedback', items: ['Alerta', 'Selo', 'Progresso', 'Esqueleto', 'Modal', 'Estado vazio'] },
    { category: 'Tabelas', items: ['Tabela', 'Ordenável', 'Zebrada'] },
  ]

  const colorPalette = [
    { name: 'Primária', value: 'oklch(0.44 0.18 48.4)', description: 'Tom terra quente' },
    { name: 'Secundária', value: 'oklch(0.6 0.15 28.3)', description: 'Complementar' },
    { name: 'Destaque', value: 'oklch(0.55 0.2 258.5)', description: 'Azul confiança' },
    { name: 'Sucesso', value: 'oklch(0.5 0.18 142.5)', description: 'Verde disponível' },
    { name: 'Atenção', value: 'oklch(0.75 0.18 64.3)', description: 'Laranja pendente' },
    { name: 'Destrutiva', value: 'oklch(0.58 0.22 29.2)', description: 'Vermelho alerta' },
  ]

  const mockProperties = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
      title: 'Apartamento Moderno',
      location: 'Zona Sul, São Paulo',
      price: 850000,
      beds: 3,
      baths: 2,
      area: 120,
      status: 'available' as const,
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      title: 'Casa de Luxo',
      location: 'Bairro Alto, Rio de Janeiro',
      price: 2500000,
      beds: 4,
      baths: 3,
      area: 280,
      status: 'sold' as const,
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      title: 'Cobertura Premium',
      location: 'Centro, Brasília',
      price: 1800000,
      beds: 3,
      baths: 3,
      area: 200,
      status: 'rented' as const,
    },
  ]

  const agents = [
    {
      id: '1',
      name: 'Carla Silva',
      email: 'carla.silva@imobiliario.com',
      phone: '(11) 99999-1234',
      sales: 45,
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Roberto Santos',
      email: 'roberto.santos@imobiliario.com',
      phone: '(11) 98888-5678',
      sales: 38,
      rating: 4.8,
    },
  ]

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Design System v1.0</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-balance">
              Sistema de Design <span className="text-primary">Premium</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
              Uma arquitetura visual completa e sofisticada para a plataforma de imóveis. 
              Componentes reutilizáveis, paleta premium, e diretrizes que garantem consistência total.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="primary" size="lg" className="gap-2">
                <Eye className="w-5 h-5" />
                Explorar Componentes
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                Documentação
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-12 border-t border-border">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">20+</div>
                <p className="text-sm sm:text-base text-muted-foreground">Componentes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">6</div>
                <p className="text-sm sm:text-base text-muted-foreground">Cores Semânticas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm sm:text-base text-muted-foreground">Responsivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Características Principais</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um design system completo que vai além de simples componentes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="p-6 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Components Library Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Biblioteca de Componentes</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para construir interfaces consistentes e profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {components.map((comp, idx) => (
              <div key={idx} className="p-8 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-primary" />
                  {comp.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {comp.items.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color Palette Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Paleta de Cores</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sistema de cores sofisticado com tons terrosos e acentos de confiança
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {colorPalette.map((color, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-border">
                <div className="h-24 bg-gradient-to-br from-primary/20 to-accent/20" style={{
                  backgroundColor: color.value.startsWith('oklch') ? 'hsl(48, 50%, 60%)' : color.value
                }} />
                <div className="p-4 bg-card">
                  <h3 className="font-semibold mb-1">{color.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{color.description}</p>
                  <code className="text-xs bg-background px-2 py-1 rounded">{color.value.substring(0, 20)}...</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Components Demo */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Componentes em Ação</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja todos os componentes funcionando com dados reais
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
            {[
              { id: 'overview', label: 'Visão geral' },
              { id: 'cards', label: 'Cartões' },
              { id: 'buttons', label: 'Botões' },
              { id: 'forms', label: 'Formulários' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="grid gap-6">
                <Alert type="info" title="Bem-vindo ao Design System" description="Este é um sistema de design premium para a plataforma de imóveis SaaS." />
                <div className="grid sm:grid-cols-3 gap-4">
                  <MetricCard label="Total de Imóveis" value="1.234" change={12} />
                  <MetricCard label="Vendas Mês" value="R$ 2.5M" change={8} />
                  <MetricCard label="Agentes Ativos" value="42" change={-3} />
                </div>
              </div>
            )}

            {activeTab === 'cards' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProperties.map((prop) => (
                  <PropertyCard key={prop.id} {...prop} />
                ))}
              </div>
            )}

            {activeTab === 'cards' && mockProperties.length > 0 && (
              <div className="mt-8 grid gap-4">
                <h3 className="font-semibold text-lg">Agentes Imobiliários</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} {...agent} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'buttons' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Variantes de Botões</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primário</Button>
                    <Button variant="secondary">Secundário</Button>
                    <Button variant="outline">Contorno</Button>
                    <Button variant="tertiary">Terciário</Button>
                    <Button variant="danger">Perigo</Button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Tamanhos</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" size="sm">Pequeno</Button>
                    <Button variant="primary" size="md">Médio</Button>
                    <Button variant="primary" size="lg">Grande</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'forms' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <Input placeholder="Digite seu nome" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <Input type="email" placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem</label>
                  <textarea
                    placeholder="Escreva sua mensagem aqui..."
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={4}
                  />
                </div>
                <Button variant="primary" className="w-full">Enviar</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Por Que Este Design System?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Consistência Visual</h3>
                  <p className="text-muted-foreground">Garantia de uniformidade em toda a plataforma com componentes reutilizáveis</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Desenvolvimento Acelerado</h3>
                  <p className="text-muted-foreground">Construa interfaces mais rápido com componentes prontos para uso</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Manutenção Simplificada</h3>
                  <p className="text-muted-foreground">Atualizações centralizadas que refletem em toda a plataforma</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Experiência Premium</h3>
                  <p className="text-muted-foreground">Paleta de cores sofisticada que transmite confiança e profissionalismo</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Acessibilidade</h3>
                  <p className="text-muted-foreground">Componentes construídos com conformidade WCAG em mente</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-success mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Escalabilidade</h3>
                  <p className="text-muted-foreground">Sistema preparado para crescer com a plataforma sem comprometer a qualidade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Utilize este design system para construir a próxima geração da plataforma imobiliária
          </p>
          <Button variant="primary" size="lg" className="gap-2">
            Começar a Usar
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 sm:px-6 lg:px-8 py-12 bg-card/50">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>Design System v1.0 • Desenvolvido para a plataforma de imóveis • 2024</p>
        </div>
      </footer>
    </div>
  )
}
