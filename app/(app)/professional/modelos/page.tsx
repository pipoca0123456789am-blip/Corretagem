'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Phase12State, useUiLoad } from '@/components/professional/shared'
import { visualModels } from '@/lib/phase12-data'

export default function ProfessionalModelsPage() {
  const { state, reload } = useUiLoad()
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Modelos' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modelos visuais disponíveis</h1>
          <p className="text-sm text-muted-foreground">Escolha o estilo base; a produção personaliza com sua marca</p>
        </div>
        <Phase12State state={state} onRetry={reload}>
          <div className="grid gap-4 lg:grid-cols-3">
            {visualModels.map((model) => (
              <div key={model.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <img src={model.image} alt={model.name} className="h-44 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-foreground">{model.name}</h2>
                    <Badge variant="default">{model.style}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {model.highlights.map((h) => (
                      <Badge key={h} variant="info">
                        {h}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/professional/solicitar?modelo=${model.id}`}>
                    <Button className="w-full" size="sm">
                      Escolher este modelo
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
