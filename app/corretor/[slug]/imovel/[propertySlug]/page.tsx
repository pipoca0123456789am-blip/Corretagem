'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  MapPin,
  Maximize2,
  Printer,
  Ruler,
  Share2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Modal } from '@/components/design-system/feedback/modal'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import { Progress } from '@/components/design-system/feedback/progress'
import {
  QualificationForm,
  ScheduleForm,
  WhatsAppButton,
} from '@/components/public-realtor/site-chrome'
import {
  financingSimulation,
  formatCurrency,
  getPropertyPageDetail,
  purposeLabel,
  publicPropertyStatusLabels,
} from '@/lib/phase10-data'
import { toCardStatus } from '@/lib/phase9-data'
import { copyToClipboard, getSitePublicUrl, whatsappShareUrl } from '@/lib/meu-site-data'

function SharePropertyPanel({
  profileSlug,
  propertySlug,
  title,
  onCopied,
}: {
  profileSlug: string
  propertySlug: string
  title: string
  onCopied: () => void
}) {
  const url =
    typeof window !== 'undefined'
      ? getSitePublicUrl(profileSlug, `/imovel/${propertySlug}`)
      : `/${profileSlug}/imovel/${propertySlug}`
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`

  return (
    <div className="space-y-4">
      <p className="break-all text-sm text-muted-foreground">{url}</p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={async () => {
            try {
              await copyToClipboard(url)
              onCopied()
            } catch {
              /* ignore */
            }
          }}
        >
          Copiar link
        </Button>
        <a href={whatsappShareUrl(`${title} — ${url}`)} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            WhatsApp
          </Button>
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
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
          onClick={async () => {
            try {
              await copyToClipboard(url)
              onCopied()
            } catch {
              /* ignore */
            }
          }}
        >
          Instagram (copiar)
        </Button>
      </div>
      <img src={qr} alt="QR Code" className="h-36 w-36 rounded-lg border border-border bg-white p-2" />
    </div>
  )
}

export default function PublicPropertyPage() {
  const params = useParams()
  const realtorSlug = String(params.slug)
  const propertySlug = String(params.propertySlug)

  const detail = useMemo(
    () => getPropertyPageDetail(realtorSlug, propertySlug),
    [realtorSlug, propertySlug]
  )

  const [activeMedia, setActiveMedia] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [mediaModal, setMediaModal] = useState<'video' | 'tour360' | 'planta' | null>(null)
  const [favorite, setFavorite] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [success, setSuccess] = useState('')
  const [downPercent, setDownPercent] = useState(20)
  const [months, setMonths] = useState(360)
  const [proposal, setProposal] = useState({ name: '', phone: '', value: '', message: '' })
  const touchX = useRef(0)

  if (!detail) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Imóvel não encontrado"
          description="Este anúncio não existe ou não pertence a este corretor."
        />
        <div className="mt-6 text-center">
          <Link href={`/corretor/${realtorSlug}/imoveis`}>
            <Button variant="outline">Voltar aos imóveis</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { property, profile, media, similar } = detail
  const current = media[activeMedia] || media[0]
  const simulation = financingSimulation(
    property.purpose === 'aluguel' ? property.price * 200 : property.price,
    downPercent,
    months
  )
  const statusVariant =
    property.status === 'available'
      ? 'success'
      : property.status === 'sold' || property.status === 'unavailable'
        ? 'destructive'
        : property.status === 'rented' || property.status === 'reserved'
          ? 'warning'
          : 'info'

  const goMedia = (dir: -1 | 1) => {
    setActiveMedia((prev) => (prev + dir + media.length) % media.length)
  }

  const flash = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.changedTouches[0]?.clientX ?? 0
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const x = e.changedTouches[0]?.clientX ?? 0
    const delta = x - touchX.current
    if (Math.abs(delta) < 40) return
    goMedia(delta < 0 ? 1 : -1)
  }

  return (
    <div className="overflow-x-hidden pb-28 lg:pb-10">
      {/* Breadcrumb strip */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-3 text-sm text-muted-foreground md:px-6">
          <Link href={`/corretor/${profile.slug}`} className="hover:text-foreground">
            {profile.firstName}
          </Link>
          <span>/</span>
          <Link href={`/corretor/${profile.slug}/imoveis`} className="hover:text-foreground">
            Imóveis
          </Link>
          <span>/</span>
          <span className="truncate text-foreground">{property.title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        {success && (
          <Alert className="mb-4" variant="success" description={success} onClose={() => setSuccess('')} />
        )}

        {/* Gallery */}
        <section className="space-y-3">
          <div
            className="relative overflow-hidden rounded-2xl bg-muted touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button type="button" className="block w-full" onClick={() => setLightbox(true)}>
              <img
                src={current.url}
                alt={current.label}
                className="aspect-[16/10] w-full object-cover md:aspect-[21/10]"
                loading="eager"
              />
            </button>
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant={statusVariant}>{publicPropertyStatusLabels[property.status]}</Badge>
              <Badge variant="primary">{purposeLabel(property.purpose)}</Badge>
              <Badge variant="default">{current.label}</Badge>
            </div>
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button
                type="button"
                onClick={() => goMedia(-1)}
                className="touch-target rounded-full bg-black/45 p-2 text-white"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="button"
                onClick={() => goMedia(1)}
                className="touch-target rounded-full bg-black/45 p-2 text-white"
                aria-label="Próxima"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white"
            >
              <Expand className="h-3.5 w-3.5" />
              Ampliar
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveMedia(index)
                  if (item.kind === 'video') setMediaModal('video')
                  if (item.kind === 'tour360') setMediaModal('tour360')
                  if (item.kind === 'planta') setMediaModal('planta')
                }}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                  index === activeMedia ? 'border-primary' : 'border-border'
                }`}
              >
                <img src={item.url} alt={item.label} className="h-full w-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[10px] text-white">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setMediaModal('video')}>
              Vídeo
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMediaModal('tour360')}>
              Tour 360°
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMediaModal('planta')}>
              Planta
            </Button>
            <Button size="sm" variant="outline" onClick={() => setActiveMedia(media.findIndex((m) => m.kind === 'drone') || 0)}>
              Drone
            </Button>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-8">
            {/* Title block */}
            <section>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{detail.code} · {detail.typeLabel}</p>
                  <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">{property.title}</h1>
                  <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(property.price)}
                    {property.purpose === 'aluguel' ? <span className="text-base">/mês</span> : null}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Spec icon={<Ruler className="h-4 w-4" />} label="Área" value={`${property.area} m²`} />
                <Spec icon={<BedDouble className="h-4 w-4" />} label="Quartos" value={String(property.bedrooms)} />
                <Spec icon={<Sparkles className="h-4 w-4" />} label="Suítes" value={String(detail.suites)} />
                <Spec icon={<Bath className="h-4 w-4" />} label="Banheiros" value={String(property.bathrooms)} />
                <Spec icon={<Car className="h-4 w-4" />} label="Vagas" value={String(property.garage)} />
                <Spec icon={<Building2 className="h-4 w-4" />} label="Condomínio" value={formatCurrency(detail.condoFee)} />
                <Spec icon={<Building2 className="h-4 w-4" />} label="IPTU/ano" value={formatCurrency(detail.iptu)} />
                <Spec
                  icon={<Maximize2 className="h-4 w-4" />}
                  label="Finalidade"
                  value={purposeLabel(property.purpose)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={favorite ? 'secondary' : 'outline'}
                  leftIcon={<Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />}
                  onClick={() => {
                    setFavorite((v) => !v)
                    flash(favorite ? 'Removido dos favoritos.' : 'Imóvel favoritado (simulado).')
                  }}
                >
                  Favoritar
                </Button>
                <Button size="sm" variant="outline" leftIcon={<Share2 className="h-4 w-4" />} onClick={() => setShareOpen(true)}>
                  Compartilhar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Printer className="h-4 w-4" />}
                  onClick={() => {
                    flash('Pré-visualização de impressão simulada.')
                    window.print()
                  }}
                >
                  Imprimir
                </Button>
              </div>
            </section>

            {!detail.convertible && (
              <Alert
                variant="warning"
                title={`Imóvel ${publicPropertyStatusLabels[property.status].toLowerCase()}`}
                description="Você ainda pode falar com o corretor para alternativas semelhantes na carteira dele."
              />
            )}

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Descrição</h2>
              <p className="leading-relaxed text-muted-foreground">{detail.fullDescription}</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Características</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {detail.features.map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Diferenciais</h2>
              <div className="flex flex-wrap gap-2">
                {detail.differentials.map((item) => (
                  <Badge key={item} variant="default">{item}</Badge>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Localização e bairro</h2>
              <p className="text-muted-foreground">{detail.neighborhoodInfo}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Nearby title="Escolas próximas" items={detail.nearby.schools} />
                <Nearby title="Mercados" items={detail.nearby.markets} />
                <Nearby title="Farmácias" items={detail.nearby.pharmacies} />
                <Nearby title="Restaurantes" items={detail.nearby.restaurants} />
                <Nearby title="Transporte" items={detail.nearby.transit} />
              </div>
              <div className="flex aspect-[16/7] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                Mapa ilustrativo da região de {property.neighborhood} — integração real não habilitada.
              </div>
            </section>

            {property.purpose !== 'aluguel' && (
              <section className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6">
                <h2 className="text-xl font-bold text-foreground">Simulação visual de financiamento</h2>
                <p className="text-sm text-muted-foreground">
                  Estimativa ilustrativa — não é uma simulação bancária oficial.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Entrada estimada"
                    value={String(downPercent)}
                    onChange={(e) => setDownPercent(Number(e.target.value))}
                    options={[
                      { value: '10', label: '10%' },
                      { value: '20', label: '20%' },
                      { value: '30', label: '30%' },
                      { value: '40', label: '40%' },
                    ]}
                  />
                  <Select
                    label="Prazo"
                    value={String(months)}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    options={[
                      { value: '240', label: '20 anos' },
                      { value: '300', label: '25 anos' },
                      { value: '360', label: '30 anos' },
                    ]}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Entrada" value={formatCurrency(simulation.down)} />
                  <Metric label="Valor financiado" value={formatCurrency(simulation.financed)} />
                  <Metric label="Parcela estimada" value={formatCurrency(simulation.installment)} />
                </div>
                <Progress value={downPercent} label="Percentual de entrada" />
              </section>
            )}

            {property.purpose === 'aluguel' && (
              <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
                <Metric label="Aluguel" value={formatCurrency(property.price)} />
                <Metric label="Condomínio" value={formatCurrency(detail.condoFee)} />
              </section>
            )}
          </div>

          {/* Desktop conversion column */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <img src={profile.photo} alt={profile.name} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-foreground">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{profile.creci}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <WhatsAppButton profile={profile} className="w-full" label="WhatsApp do corretor" />
                {detail.convertible && (
                  <Button variant="secondary" className="w-full" onClick={() => setProposalOpen(true)}>
                    Fazer proposta
                  </Button>
                )}
                <Link href={`/corretor/${profile.slug}/contato`}>
                  <Button variant="outline" className="w-full">
                    Contato
                  </Button>
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Entrada est.: {formatCurrency(detail.estimatedDownPayment)}</p>
                <p>Parcela est.: {formatCurrency(detail.estimatedInstallment)}</p>
              </div>
            </div>

            <div className="hidden lg:block">
              <ScheduleForm profile={profile} />
            </div>
            <div className="hidden lg:block">
              <QualificationForm profile={profile} />
            </div>
          </aside>
        </div>

        {/* Similar */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">
            Imóveis semelhantes de {profile.firstName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Apenas anúncios da carteira deste corretor
          </p>
          {similar.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Sem semelhantes no momento"
                description="Não há outros imóveis disponíveis deste corretor para sugerir."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <Link key={item.id} href={`/corretor/${profile.slug}/imovel/${item.slug}`}>
                  <PropertyCard
                    image={item.image}
                    title={item.title}
                    location={item.address}
                    price={item.price}
                    status={toCardStatus(item.status)}
                    bedrooms={item.bedrooms || undefined}
                    bathrooms={item.bathrooms || undefined}
                    area={item.area}
                    agent={{ name: profile.name }}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="agendar-visita-mobile" className="mt-10 grid scroll-mt-24 gap-6 lg:hidden">
          <ScheduleForm profile={profile} />
          <QualificationForm profile={profile} />
        </section>
      </div>

      {/* Mobile fixed conversion bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <WhatsAppButton profile={profile} size="sm" label="WhatsApp" className="min-h-12 w-full" />
          <Button
            size="sm"
            variant="outline"
            className="min-h-12"
            onClick={() => {
              document.getElementById('agendar-visita-mobile')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Agendar visita
          </Button>
          <Button
            size="sm"
            className="min-h-12"
            onClick={() => setProposalOpen(true)}
            disabled={!detail.convertible}
          >
            Tenho interesse
          </Button>
        </div>
      </div>

      {/* Lightbox */}
      <Modal
        isOpen={lightbox}
        onClose={() => setLightbox(false)}
        title="Galeria ampliada"
        size="lg"
        className="max-w-4xl"
        footer={<Button onClick={() => setLightbox(false)}>Fechar</Button>}
      >
        <img src={current.url} alt={current.label} className="max-h-[70vh] w-full rounded-lg object-contain" />
      </Modal>

      <Modal
        isOpen={mediaModal === 'video'}
        onClose={() => setMediaModal(null)}
        title="Vídeo do imóvel"
        description="Reprodução simulada"
        footer={<Button onClick={() => setMediaModal(null)}>Fechar</Button>}
      >
        <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
          Player de vídeo ilustrativo
        </div>
      </Modal>

      <Modal
        isOpen={mediaModal === 'tour360'}
        onClose={() => setMediaModal(null)}
        title="Tour virtual 360°"
        description="Experiência simulada — sem engine 360 real"
        footer={<Button onClick={() => setMediaModal(null)}>Fechar</Button>}
      >
        <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
          Tour 360° ilustrativo do imóvel
        </div>
      </Modal>

      <Modal
        isOpen={mediaModal === 'planta'}
        onClose={() => setMediaModal(null)}
        title="Planta do imóvel"
        footer={<Button onClick={() => setMediaModal(null)}>Fechar</Button>}
      >
        <img
          src={media.find((m) => m.kind === 'planta')?.url || property.image}
          alt="Planta"
          className="w-full rounded-lg object-cover"
        />
      </Modal>

      <Modal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Compartilhar imóvel"
        description="Link exclusivo deste corretor — a carteira não é misturada"
        footer={<Button variant="tertiary" onClick={() => setShareOpen(false)}>Fechar</Button>}
      >
        <SharePropertyPanel
          profileSlug={profile.slug}
          propertySlug={property.slug}
          title={property.title}
          onCopied={() => flash('Link copiado. Lead permanece com este corretor.')}
        />
      </Modal>

      <Modal
        isOpen={proposalOpen}
        onClose={() => setProposalOpen(false)}
        title="Fazer proposta"
        description={`Proposta enviada exclusivamente para ${profile.name}`}
        size="lg"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setProposalOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!proposal.name || !proposal.phone || !proposal.value) return
                setProposalOpen(false)
                setProposal({ name: '', phone: '', value: '', message: '' })
                flash('Proposta registrada e vinculada ao corretor responsável (simulado).')
              }}
            >
              Enviar proposta
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" value={proposal.name} onChange={(e) => setProposal({ ...proposal, name: e.target.value })} />
          <Input label="Telefone" value={proposal.phone} onChange={(e) => setProposal({ ...proposal, phone: e.target.value })} />
          <Input label="Valor ofertado (R$)" type="number" value={proposal.value} onChange={(e) => setProposal({ ...proposal, value: e.target.value })} />
          <Textarea label="Mensagem" value={proposal.message} onChange={(e) => setProposal({ ...proposal, message: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function Nearby({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
