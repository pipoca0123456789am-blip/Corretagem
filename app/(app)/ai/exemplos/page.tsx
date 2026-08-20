'use client'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Badge } from '@/components/design-system/feedback/badge'
import { AiPageState, useAiLoad } from '@/components/ai-agent/shared'
import { exampleDialogs } from '@/lib/phase13-data'

export default function AiExamplesPage() {
  const { state, reload } = useAiLoad()
  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Exemplos' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exemplos de atendimento</h1>
          <p className="text-sm text-muted-foreground">Simulações visuais — sem envio real de mensagens</p>
        </div>
        <AiPageState state={state} onRetry={reload}>
          <div className="grid gap-4 lg:grid-cols-2">
            {exampleDialogs.map((dialog) => (
              <div key={dialog.title} className="rounded-xl border border-border bg-card p-4">
                <h2 className="mb-3 font-semibold text-foreground">{dialog.title}</h2>
                <div className="space-y-2">
                  {dialog.lines.map((line, idx) => (
                    <div
                      key={`${dialog.title}-${idx}`}
                      className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                        line.from === 'cliente'
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : line.from === 'sistema'
                            ? 'mx-auto bg-muted text-muted-foreground'
                            : 'bg-muted text-foreground'
                      }`}
                    >
                      <Badge variant="default" className="mb-1">
                        {line.from}
                      </Badge>
                      <p>{line.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AiPageState>
      </div>
    </div>
  )
}
