'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Alert } from '@/components/design-system/feedback/alert'
import { Progress } from '@/components/design-system/feedback/progress'
import { getPublicRealtorBySlug, PublicRealtorProfile } from '@/lib/phase9-data'
import { addSiteLead, getMergedPublicProfile } from '@/lib/meu-site-data'

const DRAFT_KEY = 'imovelhub_encontrar_draft'

export default function EncontrarImovelPage() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params.slug)
  const [profile, setProfile] = useState<PublicRealtorProfile | null>(null)
  const [step, setStep] = useState<'qualify' | 'account'>('qualify')
  const [prefs, setPrefs] = useState({
    objective: 'comprar',
    type: 'apartamento',
    city: 'São Paulo',
    neighborhood: '',
    price: '',
    bedrooms: '2',
    bathrooms: '1',
    garage: '1',
    deadline: 'até 6 meses',
    financing: 'sim',
    downPayment: '',
    fgts: 'nao',
    income: '',
  })
  const [account, setAccount] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    password: '',
    lgpd: false,
    terms: false,
  })
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    setProfile(getMergedPublicProfile(slug) || getPublicRealtorBySlug(slug) || null)
    try {
      const raw = sessionStorage.getItem(`${DRAFT_KEY}:${slug}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.prefs) setPrefs(parsed.prefs)
        if (parsed.account) setAccount({ ...parsed.account, password: '' })
        if (parsed.step) setStep(parsed.step)
      }
    } catch {
      /* ignore */
    }
    const sync = () => setOffline(!navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('offline', sync)
    }
  }, [slug])

  useEffect(() => {
    if (!profile) return
    try {
      sessionStorage.setItem(
        `${DRAFT_KEY}:${slug}`,
        JSON.stringify({ step, prefs, account: { ...account, password: '' } })
      )
    } catch {
      /* ignore */
    }
  }, [step, prefs, account, slug, profile])

  const progress = step === 'qualify' ? 50 : 100

  if (!profile) return null
  const base = `/corretor/${profile.slug}`

  const goAccount = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('account')
  }

  const finish = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (offline) {
      setError(
        'Você está sem conexão. O cadastro não pode ser enviado agora. Seus dados foram preservados neste dispositivo.'
      )
      return
    }
    if (!account.name || !account.email || !account.phone || !account.password) {
      setError('Preencha nome, telefone, e-mail e senha.')
      return
    }
    if (!account.lgpd || !account.terms) {
      setError('Aceite LGPD e os termos para continuar.')
      return
    }
    addSiteLead({
      realtorId: profile.id,
      name: account.name,
      email: account.email,
      phone: account.whatsapp || account.phone,
      source: 'encontrar-imovel',
      preferences: prefs,
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'clientPendingSignup',
        JSON.stringify({
          ...account,
          realtorSlug: profile.slug,
          realtorId: profile.id,
          preferences: prefs,
        })
      )
      sessionStorage.removeItem(`${DRAFT_KEY}:${slug}`)
    }
    router.push(`/cliente/${profile.slug}/cadastro`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28 md:px-6 md:py-14">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Captação exclusiva · {profile.name}
      </p>
      <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Encontrar meu imóvel</h1>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">
        Qualifique seu perfil e cadastre-se. Seu atendimento permanece vinculado a este corretor.
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          Etapa {step === 'qualify' ? '1' : '2'} de 2 · progresso preservado neste dispositivo
        </p>
        <Progress value={progress} />
      </div>

      {offline ? (
        <Alert
          className="mt-4"
          variant="warning"
          description="Sem conexão. Você pode preencher o formulário; o envio só será possível online."
        />
      ) : null}

      {step === 'qualify' ? (
        <form onSubmit={goAccount} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
          <Select
            label="Objetivo"
            value={prefs.objective}
            onChange={(e) => setPrefs({ ...prefs, objective: e.target.value })}
            options={[
              { value: 'comprar', label: 'Comprar' },
              { value: 'alugar', label: 'Alugar' },
              { value: 'investir', label: 'Investir' },
            ]}
          />
          <Select
            label="Tipo"
            value={prefs.type}
            onChange={(e) => setPrefs({ ...prefs, type: e.target.value })}
            options={[
              { value: 'apartamento', label: 'Apartamento' },
              { value: 'casa', label: 'Casa' },
              { value: 'comercial', label: 'Comercial' },
              { value: 'terreno', label: 'Terreno' },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Cidade" value={prefs.city} onChange={(e) => setPrefs({ ...prefs, city: e.target.value })} />
            <Input
              label="Bairro"
              value={prefs.neighborhood}
              onChange={(e) => setPrefs({ ...prefs, neighborhood: e.target.value })}
            />
          </div>
          <Input
            label="Faixa de preço"
            placeholder="Ex: até R$ 800.000"
            value={prefs.price}
            onChange={(e) => setPrefs({ ...prefs, price: e.target.value })}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Quartos" value={prefs.bedrooms} onChange={(e) => setPrefs({ ...prefs, bedrooms: e.target.value })} />
            <Input label="Banheiros" value={prefs.bathrooms} onChange={(e) => setPrefs({ ...prefs, bathrooms: e.target.value })} />
            <Input label="Garagem" value={prefs.garage} onChange={(e) => setPrefs({ ...prefs, garage: e.target.value })} />
          </div>
          <Select
            label="Prazo"
            value={prefs.deadline}
            onChange={(e) => setPrefs({ ...prefs, deadline: e.target.value })}
            options={[
              { value: 'imediato', label: 'Imediato' },
              { value: 'até 3 meses', label: 'Até 3 meses' },
              { value: 'até 6 meses', label: 'Até 6 meses' },
              { value: 'acima de 6 meses', label: 'Acima de 6 meses' },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Financiamento"
              value={prefs.financing}
              onChange={(e) => setPrefs({ ...prefs, financing: e.target.value })}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
                { value: 'avaliar', label: 'A avaliar' },
              ]}
            />
            <Select
              label="FGTS"
              value={prefs.fgts}
              onChange={(e) => setPrefs({ ...prefs, fgts: e.target.value })}
              options={[
                { value: 'sim', label: 'Sim' },
                { value: 'nao', label: 'Não' },
              ]}
            />
          </div>
          <Input
            label="Entrada (opcional)"
            value={prefs.downPayment}
            onChange={(e) => setPrefs({ ...prefs, downPayment: e.target.value })}
          />
          <Input
            label="Renda familiar (opcional)"
            value={prefs.income}
            onChange={(e) => setPrefs({ ...prefs, income: e.target.value })}
          />
          <Button type="submit" className="min-h-12 w-full" size="lg">
            Continuar para cadastro
          </Button>
        </form>
      ) : (
        <form onSubmit={finish} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
          {error ? <Alert variant="warning" description={error} /> : null}
          <Alert
            variant="info"
            description={`Cadastro vinculado exclusivamente a ${profile.name}. Não haverá compartilhamento com outros corretores.`}
          />
          <Input label="Nome" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
          <Input label="Telefone" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} />
          <Input
            label="WhatsApp"
            value={account.whatsapp}
            onChange={(e) => setAccount({ ...account, whatsapp: e.target.value })}
          />
          <Input
            label="E-mail"
            type="email"
            value={account.email}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
          />
          <Input
            label="Senha"
            type="password"
            value={account.password}
            onChange={(e) => setAccount({ ...account, password: e.target.value })}
          />
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={account.lgpd}
              onChange={(e) => setAccount({ ...account, lgpd: e.target.checked })}
              className="mt-1 h-5 w-5"
            />
            Aceito o tratamento de dados conforme a LGPD para atendimento imobiliário.
          </label>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={account.terms}
              onChange={(e) => setAccount({ ...account, terms: e.target.checked })}
              className="mt-1 h-5 w-5"
            />
            Aceito os termos de uso e o vínculo exclusivo com este corretor.
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="min-h-12" onClick={() => setStep('qualify')}>
              Voltar
            </Button>
            <Button type="submit" className="min-h-12 flex-1">
              Criar conta e abrir área do cliente
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href={`${base}/login`} className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
