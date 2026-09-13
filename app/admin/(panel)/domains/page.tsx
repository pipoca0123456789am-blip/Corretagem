'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  DomainConnection,
  DomainOrder,
  formatBRL,
  loadDomainConnections,
  loadDomainOrders,
  markDomainValidated,
} from '@/lib/template-marketplace-data'

export default function AdminDomainsPage() {
  const [orders, setOrders] = useState<DomainOrder[]>([])
  const [connections, setConnections] = useState<DomainConnection[]>([])
  const [msg, setMsg] = useState('')

  const refresh = () => {
    setOrders(loadDomainOrders())
    setConnections(loadDomainConnections())
  }

  useEffect(() => {
    refresh()
  }, [])

  const markRegistered = (id: string) => {
    const list = loadDomainOrders().map((o) =>
      o.id === id
        ? {
            ...o,
            status: 'registered' as const,
            registeredAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
            notes: 'Registrado manualmente pelo Super Admin (provedor ainda não integrado).',
          }
        : o
    )
    localStorage.setItem('imovelhub_domain_orders_v1', JSON.stringify(list))
    setMsg(`Pedido ${id} marcado como registrado (manual).`)
    refresh()
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Domínios' },
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold text-white">Domínios</h1>
        <p className="mt-1 text-sm text-slate-400">
          Provider atual: manual. Não fingimos registro automático. SSL/DNS validados sob ação assistida.
        </p>
      </div>

      {msg ? <Alert variant="success" description={msg} /> : null}

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 overflow-x-auto">
        <h2 className="mb-3 font-semibold text-white">Pedidos de compra</h2>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="py-2">Domínio</th>
              <th className="py-2">Corretor</th>
              <th className="py-2">Total</th>
              <th className="py-2">Status</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-slate-500">
                  Nenhum pedido.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-800">
                  <td className="py-3">{o.domain}</td>
                  <td className="py-3">#{o.realtorId}</td>
                  <td className="py-3">{formatBRL(o.registrationPrice + o.serviceFee)}</td>
                  <td className="py-3">
                    <Badge variant="secondary">{o.status}</Badge>
                  </td>
                  <td className="py-3">
                    {o.status === 'manual_processing' ? (
                      <Button size="sm" onClick={() => markRegistered(o.id)}>
                        Marcar registrado
                      </Button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 overflow-x-auto">
        <h2 className="mb-3 font-semibold text-white">Conexões (domínio existente)</h2>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-700">
              <th className="py-2">Domínio</th>
              <th className="py-2">Corretor</th>
              <th className="py-2">Status</th>
              <th className="py-2">SSL</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {connections.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-slate-500">
                  Nenhuma conexão.
                </td>
              </tr>
            ) : (
              connections.map((c) => (
                <tr key={c.id} className="border-b border-slate-800">
                  <td className="py-3">{c.domain}</td>
                  <td className="py-3">#{c.realtorId}</td>
                  <td className="py-3">
                    <Badge variant="secondary">{c.status}</Badge>
                  </td>
                  <td className="py-3">{c.sslStatus}</td>
                  <td className="py-3">
                    {c.status !== 'active' ? (
                      <Button size="sm" onClick={() => { markDomainValidated(c.id); refresh() }}>
                        Validar / ativar
                      </Button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
