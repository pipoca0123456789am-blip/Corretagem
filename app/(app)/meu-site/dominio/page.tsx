'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { MeuSiteNav } from '@/components/meu-site/meu-site-nav'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getActiveDomainProvider } from '@/lib/domains/domain-provider'
import {
  DomainConnection,
  DomainOrder,
  DomainSearchResult,
  createDomainOrder,
  formatBRL,
  getBrokerDomain,
  getMarketplaceConfig,
  loadDomainOrders,
  markDomainValidated,
  startExistingDomainConnection,
} from '@/lib/template-marketplace-data'

export default function MeuSiteDomainPage() {
  const [mode, setMode] = useState<'existing' | 'buy'>('existing')
  const [domainInput, setDomainInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<DomainSearchResult[]>([])
  const [conn, setConn] = useState<DomainConnection | null>(null)
  const [orders, setOrders] = useState<DomainOrder[]>([])
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const cfg = getMarketplaceConfig()

  const refresh = () => {
    const id = getCurrentRealtorId() ?? 1
    setConn(getBrokerDomain(id))
    setOrders(loadDomainOrders().filter((o) => o.realtorId === id))
  }

  useEffect(() => {
    refresh()
  }, [])

  const connectExisting = () => {
    try {
      setError('')
      setOk('')
      const c = startExistingDomainConnection(getCurrentRealtorId() ?? 1, domainInput)
      setConn(c)
      setOk('Conexão iniciada. Configure os DNS no registrador (não pedimos sua senha).')
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    }
  }

  const search = async () => {
    setError('')
    try {
      const provider = getActiveDomainProvider()
      const list = await provider.search(searchQuery)
      setResults(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro na pesquisa')
      setResults([])
    }
  }

  const orderDomain = (r: DomainSearchResult) => {
    try {
      setError('')
      createDomainOrder(getCurrentRealtorId() ?? 1, r)
      setOk(
        `Pedido manual registrado para ${r.domain}. Registro automático ainda não está integrado — Super Admin processa.`
      )
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro')
    }
  }

  const simulateValidate = () => {
    if (!conn) return
    markDomainValidated(conn.id)
    setOk('Domínio marcado como ativo (simulação de DNS/SSL).')
    refresh()
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Meu Site', href: '/meu-site' },
          { label: 'Domínio' },
        ]}
      />
      <div className="space-y-6 p-4 pb-28 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Domínio próprio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Taxa de configuração a partir de {formatBRL(cfg.domainServiceFeeFrom)}/ano (provisório) + valor do
            registro por extensão. Provider atual: manual assistido.
          </p>
        </div>
        <MeuSiteNav />

        {error ? <Alert variant="destructive" description={error} /> : null}
        {ok ? <Alert variant="success" description={ok} /> : null}

        {conn ? (
          <section className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">{conn.domain}</h2>
              <Badge variant="secondary">{conn.status}</Badge>
              <Badge variant="info">SSL: {conn.sslStatus}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Token TXT: {conn.verificationToken}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-2">Tipo</th>
                    <th className="py-2 pr-2">Host</th>
                    <th className="py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {conn.dnsHints.map((d) => (
                    <tr key={`${d.type}-${d.host}`} className="border-b border-border/60">
                      <td className="py-2 pr-2 font-mono text-xs">{d.type}</td>
                      <td className="py-2 pr-2 font-mono text-xs">{d.host}</td>
                      <td className="py-2 break-all font-mono text-xs">{d.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {conn.status !== 'active' ? (
              <Button size="sm" onClick={simulateValidate}>
                Simular validação DNS/SSL
              </Button>
            ) : null}
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={mode === 'existing' ? 'primary' : 'outline'} onClick={() => setMode('existing')}>
            Já possuo um domínio
          </Button>
          <Button size="sm" variant={mode === 'buy' ? 'primary' : 'outline'} onClick={() => setMode('buy')}>
            Comprar um domínio
          </Button>
        </div>

        {mode === 'existing' ? (
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Conectar domínio existente</h2>
            <Input
              label="Domínio"
              placeholder="www.joaosilvaimoveis.com.br"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
            />
            <Alert
              variant="info"
              description="Não solicitamos senha do registrador. Você configura A/CNAME/TXT e nós validamos."
            />
            <Button onClick={connectExisting}>Gerar instruções DNS</Button>
          </section>
        ) : (
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-foreground">Busque seu novo domínio</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="joaosilvaimoveis.com.br"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={search}>Verificar disponibilidade</Button>
            </div>
            <Alert
              variant="warning"
              title="Sem registro automático"
              description="Disponibilidade e preços são simulados. Pedidos ficam em processamento manual até haver provedor real."
            />
            <ul className="space-y-3">
              {results.map((r) => (
                <li
                  key={r.domain}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{r.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.available ? 'Disponível' : 'Indisponível'} · Registro {formatBRL(r.registrationPrice)} ·
                      Configuração {formatBRL(r.serviceFee)} · Renovação {formatBRL(r.renewalPrice)}/ano
                    </p>
                  </div>
                  {r.available ? (
                    <Button size="sm" onClick={() => orderDomain(r)}>
                      Selecionar
                    </Button>
                  ) : (
                    <Badge variant="secondary">Indisponível</Badge>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {orders.length > 0 ? (
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold text-foreground">Pedidos de domínio</h2>
            <ul className="space-y-2 text-sm">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 py-2">
                  <span>
                    {o.domain} · {formatBRL(o.registrationPrice + o.serviceFee)}
                  </span>
                  <Badge variant="secondary">{o.status}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Link href="/meu-site" className="text-sm text-primary hover:underline">
          ← Voltar à visão geral
        </Link>
      </div>
    </div>
  )
}
