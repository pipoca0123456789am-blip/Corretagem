'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronDown,
  FolderKanban,
  Globe2,
  Lock,
  Menu,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { PLAN_PRICES_PROVISIONAL, formatCurrency, loadPlans } from '@/lib/phase14-data'
import { PROFESSIONAL_PAGE_PRICE } from '@/lib/phase12-data'
import { AI_INTEGRATION_PRICE } from '@/lib/phase13-data'
import {
  AiConversationPreview,
  ClientPortalPreview,
  CrmPreview,
  HeroComposition,
  IMG,
  IsolationPreview,
  JourneyTimeline,
  PropertiesPreview,
  TemplatePreviewCard,
  WebsitePreview,
} from '@/components/marketing/landing-mockups'

const faqs = [
  {
    q: 'Para quem é o ImóvelHub?',
    a: 'Para corretores autônomos, equipes e pequenas imobiliárias que querem centralizar imóveis, clientes e presença digital.',
  },
  {
    q: 'O Meu Site está incluído?',
    a: 'Sim. Todo corretor com plano ativo recebe automaticamente uma vitrine própria com imóveis, captação e integração ao CRM.',
  },
  {
    q: 'Posso usar meu próprio domínio?',
    a: 'Sim. Conecte um domínio existente ou pesquise um novo. Valores variam por extensão — a partir de R$ 69,90/ano.',
  },
  {
    q: 'Minha carteira fica isolada?',
    a: 'Sim. Imóveis, clientes, leads, conversas e IA ficam separados por corretor. Sem vitrine compartilhada.',
  },
  {
    q: 'Existe aplicativo?',
    a: 'Sim. A plataforma é responsiva e há PWA exclusiva para corretores no celular.',
  },
  {
    q: 'Posso ter equipe?',
    a: 'Sim. Profissional e Premium permitem mais usuários. Premium inclui cargos e permissões.',
  },
  {
    q: 'Como funciona a IA?',
    a: 'Cada corretor pode ter um agente vinculado só à própria carteira — qualificação, sugestão de imóveis, agendamento e transferência humana.',
  },
  {
    q: 'Qual diferença entre Meu Site e Template?',
    a: 'Meu Site é o modelo padrão incluso. Template Profissional (R$ 97 / 2 meses) oferece layouts da galeria. Página Premium (R$ 497) é produção sob medida.',
  },
  {
    q: 'Posso mudar de plano?',
    a: 'Sim. Upgrade ou downgrade conforme a operação. Em downgrade há período de adequação para limites.',
  },
  {
    q: 'Meus dados são apagados se eu cancelar?',
    a: 'Não apagamos automaticamente sua operação. Em downgrade ou cancelamento, dados permanecem sujeitos às regras de retenção e adequação do plano.',
  },
]

const planCopy: Record<string, { pitch: string; cta: string; bullets: string[] }> = {
  essencial: {
    pitch: 'Organize e profissionalize sua operação.',
    cta: 'Começar com o Essencial',
    bullets: [
      'Até 30 imóveis',
      '1 usuário',
      'Meu Site incluído',
      'CRM básico',
      'Agenda e área do cliente',
      'Acesso pelo celular',
    ],
  },
  profissional: {
    pitch: 'Operação comercial completa para crescer.',
    cta: 'Escolher Profissional',
    bullets: [
      'Até 150 imóveis',
      '3 usuários',
      'CRM completo',
      'Propostas e negociações',
      'Financeiro e comissões',
      'IA disponível como add-on',
    ],
  },
  premium: {
    pitch: 'Escala e controle para equipes.',
    cta: 'Escolher Premium',
    bullets: [
      'Até 500 imóveis',
      '10 usuários',
      'Gestão de equipe',
      'Relatórios avançados',
      'Domínio elegível',
      'Suporte dedicado',
    ],
  },
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [compareOpen, setCompareOpen] = useState(false)
  const plans = loadPlans().filter((p) => p.active)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const nav = [
    { href: '#produto', label: 'Produto' },
    { href: '#recursos', label: 'Recursos' },
    { href: '#meu-site', label: 'Meu Site' },
    { href: '#templates', label: 'Templates' },
    { href: '#planos', label: 'Planos' },
    { href: '#equipes', label: 'Para equipes' },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAF8] text-[#1C2434] antialiased">
      <div className="border-b border-stone-200/80 bg-white px-4 py-2 text-center text-[11px] text-stone-500">
        Ambiente de demonstração — algumas integrações e cobranças ainda são simuladas.
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-all ${
          scrolled
            ? 'border-stone-200/90 bg-white/95 shadow-sm backdrop-blur'
            : 'border-transparent bg-[#FAFAF8]/90 backdrop-blur'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="ImóvelHub" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold tracking-tight text-stone-900">ImóvelHub</span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-stone-600 transition hover:text-stone-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-stone-300 bg-white text-stone-800">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#C45C26] hover:bg-[#A84C1F]">
                Começar grátis
              </Button>
            </Link>
          </div>
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white p-2 lg:hidden"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-stone-200 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              {nav.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-sm text-stone-700">
                  {item.label}
                </a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full border-stone-300">
                  Entrar
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                <Button className="w-full bg-[#C45C26]">Começar grátis</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-stone-200/70">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(196,92,38,0.07),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-6 md:py-16 lg:py-20">
          <div>
            <span className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-stone-600 shadow-sm">
              PLATAFORMA COMPLETA PARA CORRETORES
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-stone-900 md:text-5xl lg:text-[3.4rem]">
              Sua carteira.
              <br />
              Seus clientes.
              <br />
              Sua operação.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600 md:text-lg">
              Gerencie imóveis, organize seus leads, acompanhe negociações e tenha sua própria presença
              digital em uma plataforma criada para a rotina do corretor.
            </p>
            <p className="mt-4 text-sm font-semibold text-stone-900">
              Sem dividir seus clientes com outros corretores.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full bg-[#C45C26] hover:bg-[#A84C1F] sm:w-auto">
                  Começar grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#produto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-stone-300 bg-white text-stone-800 sm:w-auto"
                >
                  Ver como funciona
                </Button>
              </a>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
              {['Meu Site incluído', 'CRM imobiliário', 'Acesso pelo celular'].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[#C45C26]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="pb-10 sm:pb-8">
            <HeroComposition />
          </div>
        </div>
      </section>

      {/* TRANSFORMAÇÃO */}
      <section id="produto" className="border-b border-stone-200 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Gerenciar imóveis não deveria significar gerenciar cinco ferramentas.
          </h2>
          <div className="mt-10 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-2xl border border-dashed border-stone-300 bg-[#F7F6F2] p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">Antes</p>
              <div className="flex flex-wrap gap-2">
                {['WhatsApp', 'Planilha', 'Agenda', 'Arquivos', 'Portais'].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-stone-500">Operação espalhada. Oportunidades se perdem.</p>
            </div>
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-[#C45C26]" />
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-md">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#C45C26]">ImóvelHub</p>
              <div className="flex flex-wrap gap-2">
                {['Imóveis', 'Clientes', 'CRM', 'Agenda', 'Financeiro', 'Meu Site'].map((item) => (
                  <span
                    key={item}
                    className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-stone-800">Tudo conectado à mesma operação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 BENEFÍCIOS */}
      <section id="recursos" className="border-b border-stone-200 bg-[#F7F6F2] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FolderKanban,
                t: 'Organize',
                d: 'Todo o relacionamento com seus clientes em um único lugar.',
              },
              {
                icon: Globe2,
                t: 'Divulgue',
                d: 'Tenha sua própria vitrine profissional para apresentar seus imóveis.',
              },
              {
                icon: TrendingUp,
                t: 'Converta',
                d: 'Acompanhe cada oportunidade do primeiro contato ao fechamento.',
              },
            ].map((b) => {
              const Icon = b.icon
              return (
                <div key={b.t} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#C45C26]/10">
                    <Icon className="h-5 w-5 text-[#C45C26]" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">{b.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{b.d}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* IMÓVEIS */}
      <section className="border-b border-stone-200 bg-white py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C45C26]">Imóveis</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Seus imóveis organizados e prontos para serem apresentados.
            </h2>
            <p className="mt-4 text-stone-600">
              Cadastre uma vez: fotos, valores, status e páginas públicas ficam na mesma operação — e
              podem aparecer automaticamente no Meu Site.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-stone-700">
              {['Fotos reais e ficha completa', 'Publicação controlada', 'Links para compartilhar', 'Métricas de visualização'].map(
                (i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#C45C26]" />
                    {i}
                  </li>
                )
              )}
            </ul>
          </div>
          <PropertiesPreview />
        </div>
      </section>

      {/* CRM */}
      <section className="border-b border-stone-200 bg-[#FAFAF8] py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <div className="md:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C45C26]">CRM</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Você sabe exatamente em que etapa cada cliente está.
            </h2>
            <p className="mt-4 text-stone-600">
              Do primeiro contato ao fechamento — com próxima ação clara e carteira isolada.
            </p>
          </div>
          <div className="md:order-1">
            <CrmPreview />
          </div>
        </div>
      </section>

      {/* JORNADA */}
      <section className="border-b border-stone-200 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Do primeiro contato ao fechamento.
          </h2>
          <div className="mt-10">
            <JourneyTimeline />
          </div>
        </div>
      </section>

      {/* MEU SITE */}
      <section id="meu-site" className="border-b border-stone-200 bg-[#F3F1EB] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#C45C26]">Presença digital</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Um site imobiliário para chamar de seu.
            </h2>
            <p className="mt-4 text-stone-600">
              Todo corretor do ImóvelHub recebe automaticamente uma vitrine própria para apresentar
              seus imóveis e captar clientes.
            </p>
          </div>
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <WebsitePreview />
            <div className="space-y-5">
              <ul className="space-y-3 text-sm text-stone-700">
                {[
                  'Link exclusivo',
                  'Imóveis automáticos',
                  'Formulário de captação',
                  'WhatsApp',
                  'Área do cliente',
                  'CRM integrado',
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/70 px-4 py-3">
                    <Check className="h-4 w-4 shrink-0 text-[#C45C26]" />
                    {i}
                  </li>
                ))}
              </ul>
              <p className="rounded-xl border border-stone-200 bg-white px-4 py-3 font-mono text-sm text-stone-800">
                imovelhub.com.br/joao-silva
              </p>
              <Link href="/signup">
                <Button className="bg-[#C45C26] hover:bg-[#A84C1F]">
                  Conhecer o Meu Site
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA DO CLIENTE */}
      <section className="border-b border-stone-200 bg-white py-14 md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Seu cliente também ganha uma experiência melhor.
            </h2>
            <p className="mt-4 text-stone-600">
              Portal privado com imóveis recomendados, favoritos, visitas, propostas e documentos —
              vinculado ao corretor responsável.
            </p>
            <p className="mt-5 text-sm font-semibold text-stone-900">
              O cliente permanece vinculado ao corretor responsável.
            </p>
          </div>
          <ClientPortalPreview />
        </div>
      </section>

      {/* IA */}
      <section className="border-b border-stone-200 bg-[#1C2434] py-14 text-white md:py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2 md:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-300">IA + WhatsApp</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Seu atendimento continua mesmo quando você está em uma visita.
            </h2>
            <p className="mt-4 text-stone-300">
              Qualificação, recomendação de imóveis, agendamento, follow-up e transferência humana —
              sempre na sua carteira.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-stone-300 sm:grid-cols-2">
              {['Qualificação', 'Recomendação', 'Agendamento', 'Follow-up', 'Transferência humana'].map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-orange-300" />
                  {i}
                </li>
              ))}
            </ul>
            <a href="#servicos" className="mt-7 inline-block">
              <Button className="bg-[#C45C26] hover:bg-[#A84C1F]">Conhecer a IA</Button>
            </a>
          </div>
          <AiConversationPreview />
        </div>
      </section>

      {/* ISOLAMENTO */}
      <section className="border-b border-stone-200 bg-[#FAFAF8] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-xl text-center">
            <Lock className="mx-auto h-6 w-6 text-[#C45C26]" />
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Sua carteira continua sendo sua.
            </h2>
            <p className="mt-3 text-stone-600">
              Nenhum cliente precisa disputar atenção dentro de uma vitrine compartilhada.
            </p>
          </div>
          <div className="mt-10">
            <IsolationPreview />
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="border-b border-stone-200 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
                Quer uma vitrine ainda mais profissional?
              </h2>
              <p className="mt-3 text-stone-600">
                Escolha um template e transforme seu Meu Site em uma página ainda mais personalizada.
              </p>
              <p className="mt-3 text-sm font-semibold text-stone-900">R$ 97 / 2 meses</p>
            </div>
            <Link href="/signup">
              <Button className="bg-[#C45C26]">Ver templates</Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <TemplatePreviewCard name="Modern" style="Contemporâneo" image={IMG.cover} />
            <TemplatePreviewCard name="Luxury" style="Alto padrão" image={IMG.apt3} />
            <TemplatePreviewCard name="Minimal" style="Clean" image={IMG.interior} />
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="border-b border-stone-200 bg-[#F7F6F2] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
              Um plano para cada momento da sua operação.
            </h2>
            <p className="mt-3 text-stone-600">
              Comece organizando sua carteira e evolua conforme crescer.
            </p>
            {PLAN_PRICES_PROVISIONAL ? (
              <Badge className="mt-3" variant="info">
                Preço provisório
              </Badge>
            ) : null}
          </div>
          <div id="equipes" className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => {
              const copy = planCopy[plan.id] || {
                pitch: plan.tagline,
                cta: 'Criar conta',
                bullets: plan.highlights,
              }
              const featured = Boolean(plan.recommended || plan.popular)
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 ${
                    featured
                      ? 'border-[#C45C26] shadow-[0_16px_50px_-20px_rgba(196,92,38,0.45)] lg:-mt-2 lg:pb-8 lg:pt-8'
                      : 'border-stone-200 shadow-sm'
                  }`}
                >
                  {featured ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-[#C45C26] px-3 py-1 text-[11px] font-semibold text-white">
                        Mais escolhido
                      </span>
                    </div>
                  ) : null}
                  <h3 className="text-xl font-bold text-stone-900">{plan.name.replace('Plano ', '')}</h3>
                  <p className="mt-2 text-sm text-stone-600">{copy.pitch}</p>
                  <p className="mt-5 text-3xl font-bold text-stone-900">
                    {formatCurrency(plan.monthlyPrice)}
                    <span className="text-base font-normal text-stone-500">/mês</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm text-stone-600">
                    {copy.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C45C26]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-6 block">
                    <Button
                      className={`w-full ${featured ? 'bg-[#C45C26] hover:bg-[#A84C1F]' : ''}`}
                      variant={featured ? 'primary' : 'outline'}
                    >
                      {copy.cta}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <button
              type="button"
              className="text-sm font-medium text-[#C45C26] hover:underline"
              onClick={() => setCompareOpen((v) => !v)}
            >
              Comparar todos os recursos
              <ChevronDown className={`ml-1 inline h-4 w-4 transition ${compareOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {compareOpen ? (
            <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-stone-50 text-stone-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Recurso</th>
                    {plans.map((p) => (
                      <th key={p.id} className="px-4 py-3 font-medium">
                        {p.name.replace('Plano ', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Imóveis', values: ['30', '150', '500'] },
                    { label: 'Usuários', values: ['1', '3', '10'] },
                    { label: 'Meu Site', values: ['Sim', 'Sim', 'Sim'] },
                    { label: 'CRM', values: ['Básico', 'Completo', 'Completo'] },
                    { label: 'Financeiro', values: ['—', 'Sim', 'Sim'] },
                    { label: 'Equipe', values: ['—', '—', 'Sim'] },
                    { label: 'IA', values: ['—', 'Add-on', 'Add-on'] },
                  ].map((row) => (
                    <tr key={row.label} className="border-t border-stone-100">
                      <td className="px-4 py-3 font-medium text-stone-800">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td key={`${row.label}-${i}`} className="px-4 py-3 text-stone-600">
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="border-b border-stone-200 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900">Personalize quando quiser.</h2>
          <p className="mt-2 text-stone-600">Serviços complementares — separados dos planos mensais.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Sparkles,
                title: 'Template profissional',
                price: 'R$ 97 / 2 meses',
                text: 'Layouts profissionais com imóveis automáticos.',
                cta: 'Ver templates',
              },
              {
                icon: Globe2,
                title: 'Página Premium',
                price: formatCurrency(PROFESSIONAL_PAGE_PRICE),
                text: 'Design exclusivo com produção acompanhada.',
                cta: 'Solicitar',
              },
              {
                icon: Globe2,
                title: 'Domínio',
                price: 'A partir de R$ 69,90/ano',
                text: 'Conecte ou pesquise um domínio próprio.',
                cta: 'Consultar',
              },
              {
                icon: Sparkles,
                title: 'IA + WhatsApp',
                price: `A partir de ${formatCurrency(AI_INTEGRATION_PRICE)}`,
                text: 'Agente isolado da sua carteira.',
                cta: 'Conhecer IA',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="flex flex-col rounded-2xl border border-stone-200 bg-[#FAFAF8] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className="h-4 w-4 text-[#C45C26]" />
                  </div>
                  <h3 className="font-bold text-stone-900">{item.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#C45C26]">{item.price}</p>
                  <p className="mt-2 flex-1 text-sm text-stone-600">{item.text}</p>
                  <Link href="/signup" className="mt-4">
                    <Button variant="outline" size="sm" className="w-full border-stone-300 bg-white">
                      {item.cta}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-stone-200 bg-[#FAFAF8] py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-center text-3xl font-bold text-stone-900">Perguntas frequentes</h2>
          <div className="mt-8 space-y-2">
            {faqs.map((item, idx) => {
              const open = faqOpen === idx
              return (
                <div key={item.q} className="rounded-xl border border-stone-200 bg-white">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                    onClick={() => setFaqOpen(open ? null : idx)}
                  >
                    <span className="font-medium text-stone-900">{item.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open ? (
                    <p className="border-t border-stone-100 px-4 py-3 text-sm leading-relaxed text-stone-600">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-b border-stone-200 bg-[#1C2434] py-16 text-white md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Transforme sua carteira em uma operação profissional.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-300">
            Imóveis, clientes, atendimento e presença digital trabalhando juntos.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full bg-[#C45C26] hover:bg-[#A84C1F] sm:w-auto">
                Começar grátis
              </Button>
            </Link>
            <a href="#planos">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                Ver planos
              </Button>
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-300">
            {['Meu Site incluído', 'Acesso no celular', 'Carteira isolada'].map((i) => (
              <li key={i} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-orange-300" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5 md:px-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="" className="h-8 w-8 rounded-lg" />
              <span className="font-bold text-stone-900">ImóvelHub</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-stone-500">
              PropTech para corretores, equipes e pequenas imobiliárias — com carteira isolada.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Produto</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-stone-500">
              <a href="#produto">Plataforma</a>
              <a href="#recursos">CRM</a>
              <a href="#recursos">Imóveis</a>
              <a href="#meu-site">Meu Site</a>
              <a href="#servicos">IA</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Recursos</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-stone-500">
              <a href="#templates">Templates</a>
              <a href="#servicos">Domínio</a>
              <a href="#servicos">Aplicativo</a>
              <a href="#servicos">Página Premium</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Planos</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-stone-500">
              <a href="#planos">Essencial</a>
              <a href="#planos">Profissional</a>
              <a href="#planos">Premium</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">Empresa</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-stone-500">
              <Link href="/contato">Contato</Link>
              <Link href="/termos">Termos</Link>
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/login">Entrar</Link>
              <Link href="/signup">Cadastro</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} ImóvelHub
        </div>
      </footer>
    </div>
  )
}
