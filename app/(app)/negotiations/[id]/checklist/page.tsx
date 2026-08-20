'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { Progress } from '@/components/design-system/feedback/progress'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import {
  ChecklistItem,
  Negotiation,
  filterByRealtor,
  initialNegotiations,
} from '@/lib/phase7-data'

export default function NegotiationChecklistPage() {
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<Negotiation | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      const found =
        filterByRealtor(initialNegotiations).find((n) => n.id === id) || null
      setItem(found)
      setChecklist(found?.checklist || [])
      setLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="p-4 md:p-6">
        <Alert variant="destructive" description="Negociação não encontrada." />
      </div>
    )
  }

  const done = checklist.filter((c) => c.done).length
  const requiredPending = checklist.filter((c) => c.required && !c.done).length
  const percent = checklist.length ? Math.round((done / checklist.length) * 100) : 0

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Negociações', href: '/negotiations' },
          { label: item.code, href: `/negotiations/${item.id}` },
          { label: 'Checklist' },
        ]}
      />

      <div className="p-4 md:p-6 space-y-6 max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Checklist de fechamento</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe os passos finais da negociação {item.code}
            </p>
          </div>
          <Link href={`/negotiations/${item.id}/complete`}>
            <Button variant="primary" disabled={requiredPending > 0}>
              Ir para conclusão
            </Button>
          </Link>
        </div>

        {success && <Alert variant="success" description={success} onClose={() => setSuccess('')} />}

        {requiredPending > 0 && (
          <Alert
            variant="warning"
            title="Itens obrigatórios pendentes"
            description={`Ainda restam ${requiredPending} item(ns) obrigatório(s) para liberar a conclusão.`}
          />
        )}

        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">
              {done}/{checklist.length} ({percent}%)
            </span>
          </div>
          <Progress value={percent} />
        </div>

        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {checklist.map((entry) => (
            <div key={entry.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={entry.id}
                  checked={entry.done}
                  onCheckedChange={(checked) => {
                    setChecklist((prev) =>
                      prev.map((c) => (c.id === entry.id ? { ...c, done: checked } : c))
                    )
                    setSuccess(`Item "${entry.label}" atualizado.`)
                    setTimeout(() => setSuccess(''), 2500)
                  }}
                />
                <label htmlFor={entry.id} className="cursor-pointer">
                  <p className="text-sm font-medium text-foreground">{entry.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.required ? 'Obrigatório' : 'Opcional'}
                  </p>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
