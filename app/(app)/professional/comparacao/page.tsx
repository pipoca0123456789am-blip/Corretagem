'use client'

import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Phase12State, useUiLoad } from '@/components/professional/shared'
import { beforeAfter } from '@/lib/phase12-data'

export default function ProfessionalComparePage() {
  const { state, reload } = useUiLoad()
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Antes e depois' },
        ]}
      />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comparação antes e depois</h1>
          <p className="text-sm text-muted-foreground">Impacto visual e comercial da página profissional</p>
        </div>
        <Phase12State state={state} onRetry={reload}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-lg font-semibold text-foreground">Antes</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {beforeAfter.before.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
              <h2 className="text-lg font-semibold text-foreground">Depois</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {beforeAfter.after.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link href="/professional/solicitar">
            <Button>Quero esse resultado</Button>
          </Link>
        </Phase12State>
      </div>
    </div>
  )
}
