'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Phase12State, useUiLoad } from '@/components/professional/shared'
import { examplePages } from '@/lib/phase12-data'

export default function ProfessionalExamplesPage() {
  const { state, reload } = useUiLoad()
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Exemplos' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exemplos de páginas</h1>
          <p className="text-sm text-muted-foreground">Referências reais da vitrine pública ImóvelHub</p>
        </div>
        <Phase12State state={state} onRetry={reload}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examplePages.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <img src={item.cover} alt="" className="h-36 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <img src={item.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.creci}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.promise}</p>
                  <Badge variant="info">/corretor/{item.slug}</Badge>
                  <Link href={`/corretor/${item.slug}`} target="_blank">
                    <Button size="sm" variant="outline" className="w-full">
                      Ver exemplo
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Phase12State>
      </div>
    </div>
  )
}
