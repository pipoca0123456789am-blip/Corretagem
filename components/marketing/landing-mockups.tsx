/**
 * Previews claros e premium da landing — PropTech imobiliário.
 * Interfaces claras (não dashboard preto).
 */
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Bath,
  BedDouble,
  Calendar,
  Car,
  Check,
  MessageCircle,
  Search,
} from 'lucide-react'

export const IMG = {
  apt1: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  apt2: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  apt3: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
  cover: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=700&fit=crop',
  broker: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
  broker2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
  interior: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
}

export function BrowserChrome({
  url,
  children,
  className = '',
}: {
  url: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_20px_60px_-24px_rgba(28,36,52,0.35)] ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        <div className="ml-2 flex-1 truncate rounded-lg border border-stone-200 bg-white px-3 py-1 text-[10px] text-stone-500">
          {url}
        </div>
      </div>
      {children}
    </div>
  )
}

export function PhoneChrome({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`mx-auto w-[170px] overflow-hidden rounded-[1.5rem] border-[3px] border-stone-800 bg-white shadow-xl ${className}`}
    >
      <div className="bg-stone-800 px-3 py-1.5">
        <div className="mx-auto h-1 w-10 rounded-full bg-stone-600" />
      </div>
      <div className="min-h-[290px] bg-white">{children}</div>
    </div>
  )
}

export function PropertyCardPreview({
  title,
  price,
  beds,
  baths,
  area,
  image,
  status = 'Publicado',
}: {
  title: string
  price: string
  beds: number
  baths: number
  area: string
  image: string
  status?: string
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3]">
        <img src={image} alt="" className="h-full w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-0.5 text-[9px] font-medium text-stone-700 shadow-sm">
          {status}
        </span>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-stone-900">{title}</p>
        <p className="mt-0.5 text-sm font-bold text-[#C45C26]">{price}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-stone-500">
          <span className="inline-flex items-center gap-0.5">
            <BedDouble className="h-3 w-3" /> {beds}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Bath className="h-3 w-3" /> {baths}
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Car className="h-3 w-3" /> 2
          </span>
          <span>{area}</span>
        </div>
      </div>
    </div>
  )
}

export function DashboardPreview() {
  return (
    <BrowserChrome url="app.imovelhub.com.br/dashboard">
      <div className="grid bg-[#FAFAF8] sm:grid-cols-[140px_1fr]">
        <aside className="hidden border-r border-stone-200 bg-white p-3 sm:block">
          <p className="mb-3 text-[11px] font-bold text-stone-900">ImóvelHub</p>
          {['Painel', 'Imóveis', 'CRM', 'Agenda', 'Meu Site'].map((l, i) => (
            <div
              key={l}
              className={`mb-0.5 rounded-lg px-2 py-1.5 text-[10px] ${
                i === 0 ? 'bg-[#C45C26]/10 font-semibold text-[#C45C26]' : 'text-stone-500'
              }`}
            >
              {l}
            </div>
          ))}
        </aside>
        <div className="space-y-3 p-3 md:p-4">
          <div>
            <p className="text-sm font-semibold text-stone-900">Bom dia, João</p>
            <p className="text-[10px] text-stone-500">Prioridades da sua carteira</p>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[
              { l: 'Leads', v: '8' },
              { l: 'Visitas', v: '3' },
              { l: 'Propostas', v: '2' },
              { l: 'Imóveis', v: '27' },
            ].map((m) => (
              <div key={m.l} className="rounded-xl border border-stone-200 bg-white p-2.5 shadow-sm">
                <p className="text-[9px] text-stone-500">{m.l}</p>
                <p className="text-lg font-bold text-stone-900">{m.v}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-white p-2.5">
              <p className="mb-2 text-[10px] font-semibold text-stone-800">Leads recentes</p>
              {['Ana Paula · Moema', 'Carlos · Aluguel', 'Marina · Cobertura'].map((n) => (
                <div key={n} className="mb-1.5 flex items-center justify-between rounded-lg bg-stone-50 px-2 py-1.5 text-[10px]">
                  <span className="text-stone-700">{n}</span>
                  <span className="rounded bg-[#C45C26]/10 px-1.5 text-[#C45C26]">Novo</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-2.5">
              <p className="mb-2 text-[10px] font-semibold text-stone-800">Visitas hoje</p>
              {['14:00 · Vila Mariana', '16:30 · Morumbi'].map((v) => (
                <div key={v} className="mb-1.5 flex items-center gap-2 rounded-lg bg-stone-50 px-2 py-1.5 text-[10px] text-stone-600">
                  <Calendar className="h-3 w-3 text-[#C45C26]" />
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  )
}

export function PropertiesPreview() {
  return (
    <BrowserChrome url="app.imovelhub.com.br/imoveis">
      <div className="bg-[#FAFAF8] p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-900">Meus imóveis</p>
            <p className="text-[10px] text-stone-500">27 ativos · 24 no site</p>
          </div>
          <span className="rounded-lg bg-[#C45C26] px-2.5 py-1.5 text-[10px] font-semibold text-white">
            + Novo imóvel
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <PropertyCardPreview
            title="Apartamento Vila Mariana"
            price="R$ 890.000"
            beds={3}
            baths={2}
            area="108 m²"
            image={IMG.apt1}
          />
          <PropertyCardPreview
            title="Casa Morumbi"
            price="R$ 1.450.000"
            beds={4}
            baths={3}
            area="220 m²"
            image={IMG.apt2}
            status="Em visita"
          />
          <PropertyCardPreview
            title="Cobertura Jardins"
            price="R$ 2.100.000"
            beds={3}
            baths={3}
            area="180 m²"
            image={IMG.apt3}
          />
        </div>
      </div>
    </BrowserChrome>
  )
}

export function CrmPreview() {
  const cols = [
    { name: 'Novo Lead', items: [{ n: 'Ana Paula', t: 'Moema · compra', hot: true }] },
    { name: 'Qualificação', items: [{ n: 'Carlos M.', t: '2–3 dorms' }] },
    { name: 'Visita', items: [{ n: 'Marina', t: 'Hoje 14:00' }] },
    { name: 'Proposta', items: [{ n: 'Juliana', t: 'R$ 870k' }] },
  ]
  return (
    <BrowserChrome url="app.imovelhub.com.br/crm">
      <div className="bg-[#FAFAF8] p-3 md:p-4">
        <p className="mb-1 text-sm font-semibold text-stone-900">CRM · Jornada do cliente</p>
        <p className="mb-3 text-[10px] text-stone-500">12 oportunidades · carteira isolada</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cols.map((col) => (
            <div key={col.name} className="min-w-[130px] flex-1 rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-wide text-stone-500">{col.name}</p>
              {col.items.map((item) => (
                <div key={item.n} className="mb-1.5 rounded-lg border border-stone-100 bg-stone-50 p-2">
                  <p className="text-[11px] font-semibold text-stone-900">{item.n}</p>
                  <p className="text-[9px] text-stone-500">{item.t}</p>
                  {'hot' in item && item.hot ? (
                    <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 text-[8px] font-medium text-amber-800">
                      Quente
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </BrowserChrome>
  )
}

export function WebsitePreview() {
  return (
    <BrowserChrome url="imovelhub.com.br/joao-silva" className="shadow-[0_28px_70px_-28px_rgba(28,36,52,0.4)]">
      <div className="relative h-36 overflow-hidden md:h-40">
        <img src={IMG.cover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/30 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end gap-3">
          <img src={IMG.broker} alt="" className="h-14 w-14 rounded-full border-2 border-white object-cover" />
          <div className="text-white">
            <p className="text-base font-semibold">João Silva</p>
            <p className="text-[11px] text-white/80">Corretor de imóveis · CRECI-SP 00.001-F</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 bg-white p-4">
        <p className="text-sm font-medium text-stone-800">
          Encontre um imóvel que combine com o seu momento.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#C45C26] px-3 py-1 text-[10px] font-semibold text-white">Comprar</span>
          <span className="rounded-full border border-stone-200 px-3 py-1 text-[10px] text-stone-600">Alugar</span>
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-[10px] text-stone-400">
            <Search className="h-3 w-3" /> Cidade, bairro…
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { t: 'Vila Mariana', p: 'R$ 890k', img: IMG.apt1 },
            { t: 'Moema', p: 'R$ 1.2M', img: IMG.interior },
            { t: 'Jardins', p: 'R$ 2.1M', img: IMG.apt3 },
          ].map((x) => (
            <div key={x.t} className="overflow-hidden rounded-lg border border-stone-150 border-stone-200">
              <img src={x.img} alt="" className="h-16 w-full object-cover" />
              <div className="p-1.5">
                <p className="truncate text-[10px] font-medium text-stone-800">{x.t}</p>
                <p className="text-[9px] font-semibold text-[#C45C26]">{x.p}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="flex-1 rounded-lg bg-[#C45C26] py-2 text-center text-[11px] font-semibold text-white">
            Ver imóveis
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-stone-200 py-2 text-[11px] font-medium text-stone-700">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
          </span>
        </div>
      </div>
    </BrowserChrome>
  )
}

export function ClientPortalPreview() {
  return (
    <BrowserChrome url="imovelhub.com.br/cliente/joao-silva">
      <div className="bg-[#FAFAF8] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
          <img src={IMG.broker} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-stone-900">Olá, Ana</p>
            <p className="text-[10px] text-stone-500">Seu corretor: João Silva</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { t: 'Recomendados', d: '4 imóveis' },
            { t: 'Favoritos', d: '2 salvos' },
            { t: 'Visitas', d: '1 agendada' },
            { t: 'Propostas', d: '1 em análise' },
            { t: 'Documentos', d: '3 arquivos' },
            { t: 'Meu corretor', d: 'João Silva' },
          ].map((item) => (
            <div key={item.t} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-semibold text-stone-900">{item.t}</p>
              <p className="text-[9px] text-stone-500">{item.d}</p>
            </div>
          ))}
        </div>
      </div>
    </BrowserChrome>
  )
}

export function AiConversationPreview() {
  return (
    <BrowserChrome url="WhatsApp · IA João Silva">
      <div className="flex min-h-[280px] flex-col bg-[#ECE5DD]">
        <div className="border-b border-stone-200 bg-[#075E54] px-3 py-2.5 text-white">
          <p className="text-[11px] font-semibold">IA · João Silva Imóveis</p>
          <p className="text-[9px] text-white/70">online · carteira isolada</p>
        </div>
        <div className="flex-1 space-y-2 p-3">
          <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-[11px] text-stone-800 shadow-sm">
            Olá, estou procurando apartamento em Moema até R$ 1 milhão.
          </div>
          <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#DCF8C6] px-3 py-2 text-[11px] text-stone-800 shadow-sm">
            Perfeito. Quantos quartos você procura?
          </div>
          <div className="max-w-[85%] rounded-lg rounded-tl-none bg-white px-3 py-2 text-[11px] text-stone-800 shadow-sm">
            3 quartos e pelo menos 2 vagas.
          </div>
          <div className="ml-auto max-w-[90%] space-y-2 rounded-lg rounded-tr-none bg-[#DCF8C6] px-3 py-2 text-[11px] text-stone-800 shadow-sm">
            <p>Encontrei opções da carteira do João:</p>
            <div className="flex gap-2 overflow-hidden rounded-lg bg-white p-1.5">
              <img src={IMG.apt1} alt="" className="h-12 w-14 rounded object-cover" />
              <div>
                <p className="font-semibold">Aptº Moema</p>
                <p className="text-[#C45C26]">R$ 890.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  )
}

export function HeroComposition() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="relative z-10">
        <DashboardPreview />
      </div>

      {/* Floating lead card */}
      <div className="absolute -left-2 top-8 z-20 hidden w-[200px] rounded-xl border border-stone-200 bg-white p-3 shadow-lg md:block lg:-left-6">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#C45C26]">Novo lead</p>
        <p className="mt-1 text-sm font-semibold text-stone-900">Ana Paula</p>
        <p className="text-[11px] text-stone-500">Apartamento · Moema</p>
      </div>

      {/* Visit card */}
      <div className="absolute bottom-16 left-4 z-20 hidden w-[180px] rounded-xl border border-stone-200 bg-white p-3 shadow-lg sm:block lg:left-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <Calendar className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-stone-900">Visita confirmada</p>
            <p className="text-[10px] text-stone-500">Hoje · 14:00</p>
          </div>
        </div>
      </div>

      {/* Property mini card */}
      <div className="absolute -right-1 top-1/3 z-20 hidden w-[160px] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg lg:block lg:-right-4">
        <img src={IMG.apt1} alt="" className="h-16 w-full object-cover" />
        <div className="p-2">
          <p className="truncate text-[10px] font-semibold text-stone-900">Aptº Vila Mariana</p>
          <p className="text-[10px] font-bold text-[#C45C26]">R$ 890.000</p>
        </div>
      </div>

      {/* Phone */}
      <div className="absolute -bottom-4 -right-2 z-30 w-[42%] sm:-bottom-6 sm:right-0 sm:w-[38%]">
        <PhoneChrome>
          <div className="relative h-20 overflow-hidden">
            <img src={IMG.cover} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
              <img src={IMG.broker} alt="" className="h-6 w-6 rounded-full border border-white object-cover" />
              <p className="text-[8px] font-semibold text-white">João Silva</p>
            </div>
          </div>
          <div className="space-y-1.5 p-2">
            <div className="overflow-hidden rounded-md border border-stone-100">
              <img src={IMG.apt2} alt="" className="h-10 w-full object-cover" />
              <p className="px-1.5 py-1 text-[8px] font-medium text-stone-800">Casa Morumbi</p>
            </div>
            <div className="rounded-md bg-[#C45C26] py-1 text-center text-[8px] font-semibold text-white">
              Meu Site
            </div>
          </div>
        </PhoneChrome>
      </div>
    </div>
  )
}

export function TemplatePreviewCard({
  name,
  style,
  image,
}: {
  name: string
  style: string
  image: string
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent" />
        <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">{name}</span>
      </div>
      <div className="flex items-center justify-between p-3">
        <p className="text-xs text-stone-500">{style}</p>
        <span className="text-xs font-medium text-[#C45C26]">Ver demo</span>
      </div>
    </div>
  )
}

export function IsolationPreview() {
  const Col = ({ name, avatar }: { name: string; avatar: string }) => (
    <div className="flex-1 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-stone-900">{name}</p>
          <p className="text-xs text-stone-500">Carteira exclusiva</p>
        </div>
      </div>
      <ul className="space-y-2">
        {['Imóveis', 'Clientes', 'CRM', 'IA'].map((i) => (
          <li key={i} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">
            {i}
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <Col name="João Silva" avatar={IMG.broker} />
      <div className="flex justify-center">
        <span className="rounded-full border border-stone-200 bg-[#F7F6F2] px-4 py-2 text-xs font-semibold text-stone-600">
          Isolados
        </span>
      </div>
      <Col name="Marina Costa" avatar={IMG.broker2} />
    </div>
  )
}

export function JourneyTimeline() {
  const steps = [
    { n: '01', t: 'Lead', d: 'O contato entra automaticamente na sua carteira.' },
    { n: '02', t: 'Qualificação', d: 'Você entende o perfil e a capacidade do cliente.' },
    { n: '03', t: 'Imóveis', d: 'Apresente opções compatíveis.' },
    { n: '04', t: 'Visita', d: 'Organize agenda e confirmação.' },
    { n: '05', t: 'Proposta', d: 'Registre condições.' },
    { n: '06', t: 'Negociação', d: 'Acompanhe contrapropostas.' },
    { n: '07', t: 'Fechamento', d: 'Finalize e registre comissão.' },
  ]
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[900px] gap-3 md:min-w-0 md:grid md:grid-cols-7">
        {steps.map((s, i) => (
          <div key={s.n} className="relative flex-1 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            {i < steps.length - 1 ? (
              <ArrowRight className="absolute -right-2.5 top-6 z-10 hidden h-4 w-4 text-stone-300 md:block" />
            ) : null}
            <p className="text-xs font-bold text-[#C45C26]">{s.n}</p>
            <p className="mt-1 font-semibold text-stone-900">{s.t}</p>
            <p className="mt-2 text-xs leading-relaxed text-stone-500">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
