'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Share2,
  AtSign,
  Link2,
  Video,
  Menu,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Modal } from '@/components/design-system/feedback/modal'
import { Alert } from '@/components/design-system/feedback/alert'
import { PublicRealtorProfile } from '@/lib/phase9-data'

export function PublicSiteHeader({ profile }: { profile: PublicRealtorProfile }) {
  const pathname = usePathname()
  const base = `/corretor/${profile.slug}`
  const [open, setOpen] = useState(false)

  const links = [
    { href: base, label: 'Início' },
    { href: `${base}/imoveis`, label: 'Imóveis' },
    { href: `${base}/encontrar`, label: 'Encontrar imóvel' },
    { href: `${base}/sobre`, label: 'Sobre' },
    { href: `${base}/contato`, label: 'Contato' },
    { href: `${base}/cadastro`, label: 'Cadastrar' },
    { href: `${base}/login`, label: 'Entrar' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href={base} className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground md:text-base">{profile.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{profile.creci}</p>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton profile={profile} size="sm" className="hidden sm:inline-flex" />
          <button
            type="button"
            className="touch-target inline-flex items-center justify-center rounded-md border border-border p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <WhatsAppButton profile={profile} className="w-full" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export function PublicSiteFooter({ profile }: { profile: PublicRealtorProfile }) {
  const base = `/corretor/${profile.slug}`
  return (
      <footer className="mt-16 border-t border-border bg-card pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-bold text-foreground">{profile.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{profile.creci}</p>
          <p className="mt-3 text-sm text-muted-foreground">{profile.promise}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Navegação</p>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href={base}>Início</Link>
            <Link href={`${base}/imoveis`}>Imóveis</Link>
            <Link href={`${base}/sobre`}>Sobre</Link>
            <Link href={`${base}/contato`}>Contato</Link>
            <Link href={`${base}/avaliacao`}>Avaliação</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Contato</p>
          <p className="text-sm text-muted-foreground">{profile.phone}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            {profile.social.instagram && <AtSign className="h-4 w-4" aria-label="Instagram" />}
            {profile.social.linkedin && <Link2 className="h-4 w-4" aria-label="LinkedIn" />}
            {profile.social.facebook && <Share2 className="h-4 w-4" aria-label="Facebook" />}
            {profile.social.youtube && <Video className="h-4 w-4" aria-label="YouTube" />}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Página pública potencializada por ImóvelHub · Leads vinculados a {profile.firstName}
          </p>
        </div>
      </div>
    </footer>
  )
}

export function WhatsAppButton({
  profile,
  size = 'md',
  className,
  label = 'Falar no WhatsApp',
}: {
  profile: PublicRealtorProfile
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="primary"
        size={size}
        className={className}
        leftIcon={<MessageCircle className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="WhatsApp (simulado)"
        description={`Lead vinculado a ${profile.name}`}
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Entendi
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Em produção, este botão abriria uma conversa com {profile.phone}. Nesta fase não há
          integração real de WhatsApp.
        </p>
      </Modal>
    </>
  )
}

export function QualificationForm({
  profile,
  compact = false,
}: {
  profile: PublicRealtorProfile
  compact?: boolean
}) {
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    interest: 'comprar',
    budget: '',
    message: '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setSuccess(true)
    setForm({ name: '', phone: '', interest: 'comprar', budget: '', message: '' })
  }

  return (
    <form onSubmit={submit} className={`space-y-4 ${compact ? '' : 'rounded-lg border border-border bg-card p-4 md:p-6'}`}>
      {!compact && (
        <div>
          <h3 className="text-lg font-semibold text-foreground">Qualifique seu atendimento</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu contato fica exclusivo com {profile.firstName}
          </p>
        </div>
      )}
      {success && (
        <Alert
          variant="success"
          title="Lead enviado"
          description={`Recebemos seu interesse. ${profile.firstName} entrará em contato em breve (simulado).`}
          onClose={() => setSuccess(false)}
        />
      )}
      <Input
        label="Nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Seu nome"
        required
      />
      <Input
        label="WhatsApp"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        placeholder="(11) 90000-0000"
        required
      />
      <Select
        label="Interesse"
        value={form.interest}
        onChange={(e) => setForm({ ...form, interest: e.target.value })}
        options={[
          { value: 'comprar', label: 'Comprar' },
          { value: 'alugar', label: 'Alugar' },
          { value: 'investir', label: 'Investir' },
          { value: 'vender', label: 'Vender meu imóvel' },
        ]}
      />
      <Input
        label="Orçamento aproximado"
        value={form.budget}
        onChange={(e) => setForm({ ...form, budget: e.target.value })}
        placeholder="Ex.: R$ 800.000"
      />
      <Textarea
        label="Mensagem"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Conte o que você procura"
      />
      <Button type="submit" variant="primary" className="w-full">
        Quero ser atendido
      </Button>
    </form>
  )
}

export function ScheduleForm({ profile }: { profile: PublicRealtorProfile }) {
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: '',
    time: '10:00',
    type: 'visita',
  })

  return (
    <form
      className="space-y-4 rounded-lg border border-border bg-card p-4 md:p-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!form.name || !form.phone || !form.date) return
        setSuccess(true)
      }}
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground">Agendar com {profile.firstName}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Visita, reunião ou call rápida</p>
      </div>
      {success && (
        <Alert
          variant="success"
          title="Agendamento registrado"
          description="Solicitação simulada e vinculada a este corretor."
          onClose={() => setSuccess(false)}
        />
      )}
      <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      <Select
        label="Tipo"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        options={[
          { value: 'visita', label: 'Visita a imóvel' },
          { value: 'reuniao', label: 'Reunião presencial' },
          { value: 'call', label: 'Videochamada' },
        ]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <Input label="Horário" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <Button type="submit" variant="secondary" className="w-full" leftIcon={<Phone className="h-4 w-4" />}>
        Solicitar agendamento
      </Button>
    </form>
  )
}

export function EvaluationForm({ profile }: { profile: PublicRealtorProfile }) {
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'apartamento',
    area: '',
    notes: '',
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!form.name || !form.phone || !form.address) return
        setSuccess(true)
      }}
    >
      {success && (
        <Alert
          variant="success"
          title="Pedido de avaliação enviado"
          description={`${profile.firstName} analisará seu imóvel e retornará com uma estimativa (simulado).`}
          onClose={() => setSuccess(false)}
        />
      )}
      <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      <Input label="Endereço do imóvel" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Tipo"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          options={[
            { value: 'apartamento', label: 'Apartamento' },
            { value: 'casa', label: 'Casa' },
            { value: 'comercial', label: 'Comercial' },
            { value: 'terreno', label: 'Terreno' },
          ]}
        />
        <Input label="Área (m²)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
      </div>
      <Textarea
        label="Detalhes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        placeholder="Andar, vagas, estado de conservação..."
      />
      <Button type="submit" variant="primary" className="w-full">
        Solicitar avaliação gratuita
      </Button>
    </form>
  )
}

export function ContactForm({ profile }: { profile: PublicRealtorProfile }) {
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!form.name || !form.message) return
        setSuccess(true)
      }}
    >
      {success && (
        <Alert
          variant="success"
          title="Mensagem enviada"
          description={`Seu contato foi vinculado a ${profile.name}.`}
          onClose={() => setSuccess(false)}
        />
      )}
      <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Textarea label="Mensagem" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
      <Button type="submit" variant="primary" className="w-full">
        Enviar mensagem
      </Button>
    </form>
  )
}
