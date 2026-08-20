'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { Button } from '@/components/design-system/buttons/button'
import { MetricCard } from '@/components/design-system/cards/metric-card'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import {
  copyToClipboard,
  ensureAutoSiteForRealtor,
  getMeuSiteSettings,
  getSiteAnalytics,
  getSiteLeads,
  getSitePublicUrl,
  whatsappShareUrl,
} from '@/lib/meu-site-data'
import { getAppSession } from '@/lib/auth'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import {
  daysUntil,
  formatBRL,
  getActiveBrokerTemplate,
  getBrokerDomain,
  getBrokerTemplateSubscription,
  getMarketplaceConfig,
  refreshSubscriptionExpiry,
} from '@/lib/template-marketplace-data'

export default function MeuSiteOverviewPage() {
  const [slug, setSlug] = useState('corretor-demonstracao')
  const [analytics, setAnalytics] = useState(getSiteAnalytics(1))
  const [leads, setLeads] = useState(getSiteLeads(1))
  const [copied, setCopied] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [templateName, setTemplateName] = useState('Meu Site básico')
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | undefined>()
  const [domainLabel, setDomainLabel] = useState('Nenhum')
  const [subStatus, setSubStatus] = useState('basic')
  const cfg = getMarketplaceConfig()

  useEffect(() => {
    const session = getAppSession()
    const realtorId = getCurrentRealtorId() ?? 1
    const settings = ensureAutoSiteForRealtor(
      realtorId,
      session?.name || 'Corretor Demonstração'
    )
    setSlug(settings.slug)
    setAnalytics(getSiteAnalytics(realtorId))
    setLeads(getSiteLeads(realtorId))
    setSiteUrl(getSitePublicUrl(settings.slug))

    let sub = getBrokerTemplateSubscription(realtorId)
    if (sub) sub = refreshSubscriptionExpiry(sub)
    const active = getActiveBrokerTemplate(realtorId)
    if (active) {
      setTemplateName(active.template.name)
      setDaysLeft(daysUntil(active.subscription.expiresAt))
      setExpiresAt(active.subscription.expiresAt?.slice(0, 10))
      setSubStatus(active.subscription.status)
    } else if (sub?.status === 'expired') {
      setTemplateName('Meu Site básico (template expirado)')
      setDaysLeft(daysUntil(sub.expiresAt))
      setExpiresAt(sub.expiresAt?.slice(0, 10))
      setSubStatus('expired')
    } else {
      setTemplateName('Meu Site básico')
      setSubStatus('basic')
    }
    const domain = getBrokerDomain(realtorId)
    setDomainLabel(domain?.status === 'active' || domain?.status === 'connected' ? domain.domain : 'Nenhum')
  }, [])

  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(siteUrl || 'https://imovelhub.local')}`,
    [siteUrl]
  )

  const copy = async (text: string, label: string) => {
    try {
      await copyToClipboard(text)
      setCopied(label)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setCopied('Falha ao copiar')
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Meu Site' }]} />
      <div className="space-y-6 p-4 pb-28 md:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Incluído na assinatura + serviços complementares
            </p>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Meu Site</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Vitrine automática na assinatura. Templates profissionais ({formatBRL(cfg.templatePrice)} /{' '}
              {cfg.templateDurationMonths} meses) e Página Premium (R$ 497) são produtos separados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${slug}`} target="_blank">
              <Button size="sm">Abrir página</Button>
            </Link>
            <Link href="/meu-site/templates">
              <Button size="sm" variant="outline">
                Templates
              </Button>
            </Link>
            <Link href="/meu-site/personalizar">
              <Button size="sm" variant="outline">
                Personalizar
              </Button>
            </Link>
          </div>
        </div>

        <MeuSiteNav />

        <Alert
          variant="info"
          title="Status da página"
          description={`Template atual: ${templateName} · Link: ${siteUrl || `/${slug}`} · Domínio: ${domainLabel}`}
        />

        {subStatus === 'expiring' || (daysLeft != null && daysLeft <= 15 && daysLeft >= 0 && subStatus !== 'basic') ? (
          <Alert
            variant="warning"
            title={`Template expira em ${daysLeft} dia(s)`}
            description={`Próxima renovação: ${expiresAt || '—'}. Renove para manter o layout profissional.`}
          />
        ) : null}

        {subStatus === 'expired' ? (
          <Alert
            variant="destructive"
            title="Template expirado"
            description="Seus dados, imóveis e personalizações foram preservados. A página pública voltou ao Meu Site básico."
          />
        ) : null}

        {copied ? <Alert variant="success" description={copied} /> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Visualizações" value={analytics.views} description="Site público" />
          <MetricCard title="Leads" value={analytics.leads} description="Captações pelo site" />
          <MetricCard title="Cadastros" value={analytics.signups} description="Contas de cliente" />
          <MetricCard
            title="Validade"
            value={daysLeft != null && subStatus !== 'basic' ? `${daysLeft}d` : '—'}
            description={subStatus === 'basic' ? 'Meu Site básico' : `até ${expiresAt || '—'}`}
          />
        </div>

        {(subStatus === 'active' || subStatus === 'expiring' || subStatus === 'expired') && (
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Seu template profissional</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Template atual: <strong className="text-foreground">{templateName}</strong>
              {daysLeft != null ? (
                <>
                  {' '}
                  · Validade: <strong className="text-foreground">{daysLeft} dias restantes</strong>
                </>
              ) : null}
              {expiresAt ? <> · Próxima renovação: {expiresAt}</> : null}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/meu-site/templates/checkout?renew=1">
                <Button size="sm">Renovar por mais {cfg.templateDurationMonths} meses</Button>
              </Link>
              <Link href="/meu-site/templates">
                <Button size="sm" variant="outline">
                  Trocar template
                </Button>
              </Link>
              <Link href="/meu-site/dominio">
                <Button size="sm" variant="outline">
                  Gerenciar domínio
                </Button>
              </Link>
              <Link href="/meu-site/templates?action=basic">
                <Button size="sm" variant="tertiary">
                  Voltar para Meu Site básico
                </Button>
              </Link>
            </div>
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Compartilhar</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use o link do site em anúncios e redes.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(siteUrl, 'Link do site copiado')}>
                Copiar link
              </Button>
              <a href={whatsappShareUrl(`Conheça meus imóveis: ${siteUrl}`)} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline">
                  WhatsApp
                </Button>
              </a>
              <Link href="/meu-site/compartilhar">
                <Button size="sm">Mais opções + QR</Button>
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <img src={qrSrc} alt="QR Code do site" className="h-28 w-28 rounded-lg border border-border bg-white p-2" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">QR Code</p>
                <p>Aponte a câmera para abrir seu site.</p>
                <p className="mt-2 break-all text-xs">{siteUrl}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">Imóveis mais vistos</h2>
            <ul className="mt-4 space-y-3">
              {analytics.propertyViews.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-foreground">{p.title}</span>
                  <Badge variant="secondary">{p.views} views</Badge>
                </li>
              ))}
              {analytics.propertyViews.length === 0 ? (
                <li className="text-sm text-muted-foreground">Publique imóveis no site para ver métricas.</li>
              ) : null}
            </ul>
            <Link href="/meu-site/imoveis" className="mt-4 inline-block text-sm text-primary hover:underline">
              Gerenciar imóveis do site →
            </Link>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-foreground">Leads captados pelo site</h2>
            <Link href="/clientes">
              <Button size="sm" variant="outline">
                Abrir CRM
              </Button>
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda sem leads. Compartilhe o site ou o fluxo “Encontrar imóvel”.
            </p>
          ) : (
            <ul className="space-y-2">
              {leads.slice(0, 8).map((l) => (
                <li
                  key={l.id}
                  className="flex flex-col gap-1 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.email} · {l.phone} · {l.source}
                    </p>
                  </div>
                  <Badge variant="info">Vinculado a você</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Alert
            variant="info"
            title={`Template profissional — ${formatBRL(cfg.templatePrice)} / ${cfg.templateDurationMonths} meses`}
            description="Escolha um modelo na galeria. Imóveis e CRM continuam os seus."
          />
          <Alert
            variant="warning"
            title="Página Profissional Premium (R$ 497)"
            description="Design exclusivo sob medida — produto diferente do template."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/meu-site/templates">
            <Button>Ver galeria de templates</Button>
          </Link>
          <Link href="/professional">
            <Button variant="outline">Conhecer Página Premium</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
