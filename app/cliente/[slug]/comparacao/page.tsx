'use client'

import { useMemo, useState } from 'react'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { formatCurrency, getRealtorProperties, purposeLabel } from '@/lib/phase11-data'
import { publicPropertyStatusLabels } from '@/lib/phase9-data'
import { getCompareIds, toggleCompare } from '@/lib/client-auth'
import { labelPt } from '@/lib/labels-pt'

export default function ClientComparePage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [tick, setTick] = useState(0)
  const items = useMemo(() => {
    if (!profile) return []
    const ids = getCompareIds()
    return getRealtorProperties(profile.id).filter((p) => ids.includes(p.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, tick])

  if (!profile) return null

  const rows = [
    { label: 'Valor', render: (p: (typeof items)[0]) => formatCurrency(p.price) },
    { label: 'Finalidade', render: (p: (typeof items)[0]) => purposeLabel(p.purpose) },
    { label: 'Área', render: (p: (typeof items)[0]) => `${p.area} m²` },
    { label: 'Quartos', render: (p: (typeof items)[0]) => String(p.bedrooms) },
    { label: 'Banheiros', render: (p: (typeof items)[0]) => String(p.bathrooms) },
    { label: 'Vagas', render: (p: (typeof items)[0]) => String(p.garage) },
    { label: 'Bairro', render: (p: (typeof items)[0]) => p.neighborhood },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Comparação</h1>
        <p className="text-sm text-muted-foreground">Até 3 imóveis da carteira de {profile.firstName}</p>
      </div>
      <PageState
        state={state === 'ready' && items.length === 0 ? 'empty' : state}
        onRetry={reload}
        emptyTitle="Nada para comparar"
        emptyDescription="Adicione imóveis pela ação Comparar nas listagens."
      >
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground">Critério</th>
                {items.map((p) => (
                  <th key={p.id} className="p-3 text-left">
                    <p className="font-semibold text-foreground">{p.title}</p>
                    <Button
                      size="sm"
                      variant="tertiary"
                      className="mt-1 px-0"
                      onClick={() => {
                        toggleCompare(p.id)
                        setTick((t) => t + 1)
                      }}
                    >
                      Remover
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="p-3 text-muted-foreground">{row.label}</td>
                  {items.map((p) => (
                    <td key={`${row.label}-${p.id}`} className="p-3 text-foreground">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-border">
                <td className="p-3 text-muted-foreground">Status</td>
                {items.map((p) => (
                  <td key={`st-${p.id}`} className="p-3">
                    <Badge variant="info">{labelPt(publicPropertyStatusLabels, p.status)}</Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </PageState>
    </div>
  )
}
