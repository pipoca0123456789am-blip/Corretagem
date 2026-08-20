'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  FileUp,
  GitCompare,
  Heart,
  Info,
  MessageCircle,
  Send,
} from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Modal } from '@/components/design-system/feedback/modal'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { PropertyCard } from '@/components/design-system/cards/property-card'
import {
  discardProperty,
  getCompareIds,
  getFavoriteIds,
  markViewed,
  toggleCompare,
  toggleFavorite,
} from '@/lib/client-auth'
import {
  formatPriceLabel,
  purposeLabel,
  toCardStatus,
} from '@/lib/phase11-data'
import { PublicProperty, PublicRealtorProfile } from '@/lib/phase9-data'

export function ClientPropertyGrid({
  properties,
  profile,
  onChange,
  showDiscard,
}: {
  properties: PublicProperty[]
  profile: PublicRealtorProfile
  onChange?: () => void
  showDiscard?: boolean
}) {
  const [favorites, setFavorites] = useState(getFavoriteIds())
  const [compare, setCompare] = useState(getCompareIds())
  const [success, setSuccess] = useState('')
  const [infoOpen, setInfoOpen] = useState<PublicProperty | null>(null)
  const [visitOpen, setVisitOpen] = useState<PublicProperty | null>(null)
  const [proposalOpen, setProposalOpen] = useState<PublicProperty | null>(null)
  const [talkOpen, setTalkOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [visitForm, setVisitForm] = useState({ date: '', time: '10:00', note: '' })
  const [proposalForm, setProposalForm] = useState({ value: '', message: '' })

  const flash = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 2800)
    onChange?.()
  }

  return (
    <div className="space-y-4">
      {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id} className="space-y-2 rounded-xl border border-border bg-card p-2">
            <Link
              href={`/corretor/${profile.slug}/imovel/${property.slug}`}
              onClick={() => markViewed(property.id)}
            >
              <PropertyCard
                image={property.image}
                title={property.title}
                location={property.address}
                price={property.price}
                status={toCardStatus(property.status)}
                bedrooms={property.bedrooms || undefined}
                bathrooms={property.bathrooms || undefined}
                area={property.area}
                agent={{ name: profile.name }}
              />
            </Link>
            <div className="flex flex-wrap gap-1 px-1">
              <Badge variant="info">{purposeLabel(property.purpose)}</Badge>
              <Badge variant="default">{formatPriceLabel(property)}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 px-1 pb-1">
              <Button
                size="sm"
                variant={favorites.includes(property.id) ? 'secondary' : 'outline'}
                leftIcon={<Heart className={`h-3.5 w-3.5 ${favorites.includes(property.id) ? 'fill-current' : ''}`} />}
                onClick={() => {
                  setFavorites(toggleFavorite(property.id))
                  flash(
                    favorites.includes(property.id)
                      ? 'Removido dos favoritos.'
                      : 'Imóvel favoritado.'
                  )
                }}
              >
                Favoritar
              </Button>
              <Button
                size="sm"
                variant={compare.includes(property.id) ? 'secondary' : 'outline'}
                leftIcon={<GitCompare className="h-3.5 w-3.5" />}
                onClick={() => {
                  const next = toggleCompare(property.id)
                  setCompare(next)
                  if (!compare.includes(property.id) && next.length === compare.length) {
                    flash('Comparação limitada a 3 imóveis.')
                  } else {
                    flash(
                      compare.includes(property.id)
                        ? 'Removido da comparação.'
                        : 'Adicionado à comparação.'
                    )
                  }
                }}
              >
                Comparar
              </Button>
              <Button size="sm" variant="outline" leftIcon={<Info className="h-3.5 w-3.5" />} onClick={() => setInfoOpen(property)}>
                Informações
              </Button>
              <Button size="sm" variant="outline" leftIcon={<MessageCircle className="h-3.5 w-3.5" />} onClick={() => setTalkOpen(true)}>
                Falar
              </Button>
              <Button size="sm" variant="outline" leftIcon={<CalendarDays className="h-3.5 w-3.5" />} onClick={() => setVisitOpen(property)}>
                Visita
              </Button>
              <Button size="sm" variant="outline" leftIcon={<Send className="h-3.5 w-3.5" />} onClick={() => {
                setProposalForm({ value: String(Math.round(property.price * 0.95)), message: '' })
                setProposalOpen(property)
              }}>
                Proposta
              </Button>
              <Button size="sm" variant="outline" leftIcon={<FileUp className="h-3.5 w-3.5" />} onClick={() => setDocOpen(true)}>
                Documento
              </Button>
              {showDiscard ? (
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => {
                    discardProperty(property.id)
                    flash('Imóvel descartado da sua lista.')
                  }}
                >
                  Descartar
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={Boolean(infoOpen)}
        onClose={() => setInfoOpen(null)}
        title="Solicitar informações"
        description={`Pedido enviado apenas para ${profile.name}`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setInfoOpen(null)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setInfoOpen(null)
                flash('Solicitação de informações registrada (simulado).')
              }}
            >
              Enviar pedido
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {infoOpen?.title} — o corretor responsável receberá seu interesse com os dados do seu perfil.
        </p>
      </Modal>

      <Modal
        isOpen={talkOpen}
        onClose={() => setTalkOpen(false)}
        title="Falar com o corretor"
        description="Mensagem simulada — sem envio real"
        footer={<Button onClick={() => setTalkOpen(false)}>Entendi</Button>}
      >
        <p className="text-sm text-muted-foreground">
          Em produção, este canal abriria conversa com {profile.name} ({profile.phone}).
        </p>
      </Modal>

      <Modal
        isOpen={Boolean(visitOpen)}
        onClose={() => setVisitOpen(null)}
        title="Agendar visita"
        description={visitOpen?.title}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setVisitOpen(null)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!visitForm.date) return
                setVisitOpen(null)
                flash('Visita solicitada ao corretor responsável (simulado).')
              }}
            >
              Solicitar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input type="date" label="Data" value={visitForm.date} onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })} />
          <Select
            label="Horário"
            value={visitForm.time}
            onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
            options={[
              { value: '10:00', label: '10:00' },
              { value: '14:00', label: '14:00' },
              { value: '16:00', label: '16:00' },
              { value: '18:00', label: '18:00' },
            ]}
          />
          <Textarea label="Observações" value={visitForm.note} onChange={(e) => setVisitForm({ ...visitForm, note: e.target.value })} />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(proposalOpen)}
        onClose={() => setProposalOpen(null)}
        title="Fazer proposta"
        description={`Vinculada a ${profile.name}`}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setProposalOpen(null)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!proposalForm.value) return
                setProposalOpen(null)
                flash('Proposta enviada ao corretor (simulado).')
              }}
            >
              Enviar proposta
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Valor (R$)"
            type="number"
            value={proposalForm.value}
            onChange={(e) => setProposalForm({ ...proposalForm, value: e.target.value })}
          />
          <Textarea
            label="Mensagem"
            value={proposalForm.message}
            onChange={(e) => setProposalForm({ ...proposalForm, message: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        isOpen={docOpen}
        onClose={() => setDocOpen(false)}
        title="Enviar documento"
        description="Upload simulado — sem envio real"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDocOpen(false)}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={() => {
                setDocOpen(false)
                flash('Documento anexado visualmente (simulado).')
              }}
            >
              Enviar
            </Button>
          </>
        }
      >
        <Input type="file" label="Arquivo" />
        <p className="mt-2 text-xs text-muted-foreground">
          O arquivo ficará disponível apenas para {profile.name}.
        </p>
      </Modal>
    </div>
  )
}
