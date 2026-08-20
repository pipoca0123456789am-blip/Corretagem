'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getMeuSiteSettings } from '@/lib/meu-site-data'
import {
  PageTemplate,
  confirmTemplatePayment,
  formatBRL,
  getBrokerTemplateSubscription,
  getMarketplaceConfig,
  getTemplateById,
  getTemplateDuration,
  getTemplatePrice,
  publishCustomization,
  renewTemplateSubscription,
  saveCustomization,
  getCustomization,
  startTemplateCheckout,
  switchTemplate,
  trackTemplateEvent,
} from '@/lib/template-marketplace-data'

function CheckoutInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('template') || ''
  const renew = searchParams.get('renew') === '1'
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [step, setStep] = useState(1)
  const [heroTitle, setHeroTitle] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [claimedPrice, setClaimedPrice] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subId, setSubId] = useState('')
  const cfg = getMarketplaceConfig()

  useEffect(() => {
    const realtorId = getCurrentRealtorId() ?? 1
    const settings = getMeuSiteSettings(realtorId)
    const custom = getCustomization(realtorId)
    setHeroTitle(String(custom.draft.heroTitle || settings.heroTitle || ''))
    setWhatsapp(String(custom.draft.whatsapp || settings.whatsapp || ''))

    if (renew) {
      const sub = getBrokerTemplateSubscription(realtorId)
      if (sub) {
        setSubId(sub.id)
        const t = getTemplateById(sub.templateId) || null
        setTemplate(t)
        setClaimedPrice(getTemplatePrice(t))
        setStep(4)
      }
      return
    }

    const t = getTemplateById(templateId) || null
    setTemplate(t)
    if (t) {
      if (t.status !== 'active') {
        setError('Template indisponível para contratação.')
        return
      }
      setClaimedPrice(getTemplatePrice(t))
      trackTemplateEvent('template_selected', { templateId: t.id, realtorId })
    } else if (templateId) {
      setError('Template não encontrado.')
    }
  }, [templateId, renew])

  const officialPrice = getTemplatePrice(template)
  const duration = getTemplateDuration(template)

  const saveDraft = () => {
    const realtorId = getCurrentRealtorId() ?? 1
    const custom = getCustomization(realtorId)
    custom.draft = { ...custom.draft, heroTitle, whatsapp }
    saveCustomization(custom)
  }

  const startCheckout = () => {
    try {
      setError('')
      if (!template) throw new Error('Selecione um template')
      saveDraft()
      const existing = getBrokerTemplateSubscription(getCurrentRealtorId())
      if (existing && (existing.status === 'active' || existing.status === 'expiring')) {
        switchTemplate(existing.id, template.id)
        setSubId(existing.id)
        setStep(4)
        return
      }
      const sub = startTemplateCheckout(template.id)
      setSubId(sub.id)
      setStep(4)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no checkout')
    }
  }

  const pay = () => {
    try {
      setError('')
      const realtorId = getCurrentRealtorId() ?? 1
      if (renew && subId) {
        renewTemplateSubscription(subId)
        publishCustomization(realtorId)
        trackTemplateEvent('template_purchased', { templateId: template?.id, realtorId })
        setSuccess('Renovação confirmada (pagamento simulado). Template ativo.')
        setTimeout(() => router.push('/meu-site'), 1200)
        return
      }
      if (!subId) throw new Error('Pedido não iniciado')
      // Preço manipulado no cliente é ignorado no backend
      confirmTemplatePayment(subId, claimedPrice)
      publishCustomization(realtorId)
      trackTemplateEvent('template_purchased', {
        templateId: template?.id,
        realtorId,
        price: officialPrice,
      })
      setSuccess(
        `Pagamento simulado confirmado. Valor oficial: ${formatBRL(officialPrice)}. Template ativo por ${duration} meses.`
      )
      setTimeout(() => router.push('/meu-site'), 1400)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no pagamento')
    }
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Templates', href: '/meu-site/templates' },
          { label: 'Checkout' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 pb-28 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checkout do template</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pagamento simulado — pedido registrado localmente. Gateway real será plugado depois.
          </p>
        </div>
        <MeuSiteNav />

        {error ? <Alert variant="destructive" description={error} /> : null}
        {success ? <Alert variant="success" description={success} /> : null}

        {!template && !error ? (
          <Alert variant="info" description="Selecione um template na galeria." />
        ) : null}

        {template ? (
          <>
            <section className="rounded-xl border border-border bg-card p-5 space-y-3">
              <p className="text-xs font-semibold uppercase text-primary">Resumo</p>
              <h2 className="text-lg font-semibold text-foreground">{template.name}</h2>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <p className="text-sm">
                Valor oficial (backend): <strong>{formatBRL(officialPrice)}</strong> · Validade:{' '}
                <strong>{duration} meses</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Moeda: {cfg.currency} · Preços configuráveis pelo Super Admin
              </p>
            </section>

            {step <= 3 ? (
              <section className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Personalização rápida</h3>
                <Input
                  label="Título principal"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                />
                <Input
                  label="WhatsApp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Imóveis, CRECI e contatos vêm do seu cadastro — sem recadastro.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      saveDraft()
                      setStep(3)
                    }}
                  >
                    Salvar e continuar
                  </Button>
                  <Button onClick={startCheckout}>Ir para pagamento</Button>
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-foreground">
                  {renew ? 'Renovação' : 'Pagamento simulado'}
                </h3>
                <Alert
                  variant="info"
                  description="Campo abaixo simula manipulação no navegador — o backend ignora e aplica o preço oficial."
                />
                <Input
                  label="Preço enviado pelo frontend (pode ser manipulado)"
                  type="number"
                  value={String(claimedPrice)}
                  onChange={(e) => setClaimedPrice(Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Total cobrado: <strong className="text-foreground">{formatBRL(officialPrice)}</strong>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={pay}>{renew ? 'Confirmar renovação' : 'Confirmar pagamento'}</Button>
                  <Link href="/meu-site/templates">
                    <Button variant="outline">Cancelar</Button>
                  </Link>
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function TemplateCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando checkout…</div>}>
      <CheckoutInner />
    </Suspense>
  )
}
