'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import {
  SupportState,
  useSupportLoad,
} from '@/components/support/shared'
import {
  FaqItem,
  HelpArticle,
  faqItems,
  getScopedTickets,
  helpArticles,
  ticketCategoryLabels,
  TicketCategory,
} from '@/lib/phase16-data'

const categories = Object.keys(ticketCategoryLabels) as TicketCategory[]

export default function HelpCenterPage() {
  const { state, reload } = useSupportLoad()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<TicketCategory | 'all'>('all')
  const [openTickets, setOpenTickets] = useState(0)

  useEffect(() => {
    setOpenTickets(
      getScopedTickets().filter((t) => !['resolvido', 'encerrado'].includes(t.status)).length
    )
  }, [state])

  const articles = useMemo(() => {
    const query = q.trim().toLowerCase()
    return helpArticles.filter((a) => {
      const matchCat = category === 'all' || a.category === category
      const matchQ =
        !query ||
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.tags.some((t) => t.toLowerCase().includes(query))
      return matchCat && matchQ
    })
  }, [q, category])

  const faqs = useMemo(() => {
    const query = q.trim().toLowerCase()
    return faqItems.filter((f) => {
      const matchCat = category === 'all' || f.category === category
      const matchQ =
        !query ||
        f.question.toLowerCase().includes(query) ||
        f.answer.toLowerCase().includes(query)
      return matchCat && matchQ
    })
  }, [q, category])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Ajuda' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Central de ajuda</h1>
            <p className="text-sm text-muted-foreground">
              Artigos, FAQ e chamados — só da sua conta
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/help/chamados">
              <Button variant="outline">Meus chamados ({openTickets})</Button>
            </Link>
            <Link href="/help/chamados/novo">
              <Button>Abrir chamado</Button>
            </Link>
          </div>
        </div>

        <Alert
          variant="info"
          description="Anexos e envios são simulados. Observações internas da equipe não aparecem para o corretor."
        />

        <SupportState state={state} onRetry={reload}>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Buscar artigos e perguntas..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="outline" onClick={reload}>
              Atualizar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={category === 'all' ? 'primary' : 'outline'}
              onClick={() => setCategory('all')}
            >
              Todas
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? 'primary' : 'outline'}
                onClick={() => setCategory(c)}
              >
                {ticketCategoryLabels[c]}
              </Button>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Artigos</h2>
            {articles.length === 0 ? (
              <SupportState
                state="empty"
                empty={{ title: 'Nenhum artigo encontrado', description: 'Ajuste a busca ou a categoria.' }}
              >
                {null}
              </SupportState>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {articles.map((a: HelpArticle) => (
                  <article key={a.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary">{ticketCategoryLabels[a.category]}</Badge>
                    </div>
                    <h3 className="mt-2 font-semibold text-foreground">{a.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
                    <p className="mt-3 text-sm text-foreground">{a.body}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Perguntas frequentes</h2>
            <div className="space-y-3">
              {faqs.map((f: FaqItem) => (
                <div key={f.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="font-semibold text-foreground">{f.question}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{f.answer}</p>
                </div>
              ))}
              {faqs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma FAQ para este filtro.</p>
              ) : null}
            </div>
          </section>

          <div className="rounded-2xl border border-border bg-primary/5 p-6">
            <h2 className="text-lg font-bold text-foreground">Ainda precisa de ajuda?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Abra um chamado com categoria, prioridade e anexos simulados.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/help/chamados/novo">
                <Button>Abrir chamado</Button>
              </Link>
              <Link href="/solicitacoes">
                <Button variant="outline">Ir para solicitações</Button>
              </Link>
            </div>
          </div>
        </SupportState>
      </div>
    </div>
  )
}
