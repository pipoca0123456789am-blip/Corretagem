'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { propertiesList } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/phase7-data'
import { labelPt, propertyStatusLabels } from '@/lib/labels-pt'

export default function AdminPropertiesPage() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const query = q.toLowerCase()
    return propertiesList.filter(
      (p) =>
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.realtor.name.toLowerCase().includes(query)
    )
  }, [q])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Imóveis' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Imóveis da plataforma</h1>
            <p className="text-sm text-muted-foreground">Visão global — cada imóvel permanece na carteira do corretor</p>
          </div>
          <Link href="/admin/reports"><Button variant="outline">Relatórios</Button></Link>
        </div>
        <Alert variant="info" description="Monitoramento global sem misturar carteiras na operação do corretor." />
        <Input placeholder="Buscar imóvel ou corretor" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{p.title}</p>
                  <Badge variant="secondary">{labelPt(propertyStatusLabels, p.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {p.address} · {p.realtor.name} · {formatCurrency(p.price)}
                </p>
              </div>
              <Link href={`/properties/${p.id}`}>
                <Button size="sm" variant="outline">Ver</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
