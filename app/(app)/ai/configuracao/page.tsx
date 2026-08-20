'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { AiPageState, AiStatusBadge, SuccessNote, useAiLoad } from '@/components/ai-agent/shared'
import {
  AiAgentConfig,
  AiIntegration,
  emptyAgentForm,
  getCurrentRealtorId,
  getRealtorAi,
  getRealtorProperties,
  styleOptions,
  toneOptions,
  upsertAi,
} from '@/lib/phase13-data'

export default function AiConfigPage() {
  const { state, reload } = useAiLoad()
  const realtorId = getCurrentRealtorId() || 1
  const [ai, setAi] = useState<AiIntegration | null>(null)
  const [form, setForm] = useState<AiAgentConfig>(emptyAgentForm(realtorId))
  const [success, setSuccess] = useState('')
  const properties = getRealtorProperties(realtorId)

  useEffect(() => {
    const current = getRealtorAi(realtorId)
    setAi(current)
    setForm(current?.config || emptyAgentForm(realtorId))
  }, [realtorId, state])

  const save = () => {
    if (!ai) return
    upsertAi({
      ...ai,
      config: form,
      status: ai.status === 'aguardando_pagamento' ? ai.status : 'em_testes',
      updatedAt: new Date().toISOString().slice(0, 10),
      history: [
        {
          id: `h-${Date.now()}`,
          label: 'Configuração do agente atualizada',
          at: new Date().toLocaleString('pt-BR'),
        },
        ...ai.history,
      ],
    })
    setSuccess('Configuração salva (simulado).')
    setAi(getRealtorAi(realtorId))
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Configuração' }]} />
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">Configuração do agente</h1>
          {ai ? <AiStatusBadge status={ai.status} /> : null}
        </div>
        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}
        <AiPageState
          state={!ai && state === 'ready' ? 'empty' : state}
          onRetry={reload}
          empty={{
            title: 'Contrate a IA primeiro',
            description: 'A configuração fica disponível após a solicitação.',
            action: { label: 'Solicitar', onClick: () => (window.location.href = '/ai/solicitar') },
          }}
        >
          {ai ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <Alert
                variant="info"
                description="Alterações valem apenas para o seu agente. Base de conhecimento isolada por corretor."
              />
              <Input label="Nome do agente" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select label="Tom de voz" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} options={toneOptions} />
                <Select label="Estilo" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} options={styleOptions} />
              </div>
              <Input label="Horários" value={form.businessHours} onChange={(e) => setForm({ ...form, businessHours: e.target.value })} />
              <Textarea label="Boas-vindas" value={form.welcomeMessage} onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })} />
              <Textarea label="Fora do horário" value={form.offlineMessage} onChange={(e) => setForm({ ...form, offlineMessage: e.target.value })} />
              <Textarea label="Regras" value={form.responseRules} onChange={(e) => setForm({ ...form, responseRules: e.target.value })} />
              <Textarea label="Limites" value={form.limits} onChange={(e) => setForm({ ...form, limits: e.target.value })} />
              <Textarea
                label="FAQs"
                value={form.faqs.join('\n')}
                onChange={(e) => setForm({ ...form, faqs: e.target.value.split('\n').filter(Boolean) })}
              />
              <Textarea
                label="Base de conhecimento"
                value={form.knowledgeBase.join('\n')}
                onChange={(e) => setForm({ ...form, knowledgeBase: e.target.value.split('\n').filter(Boolean) })}
              />
              <Textarea
                label="Palavras de intervenção"
                value={form.triggerWords.join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    triggerWords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <Checkbox
                checked={form.humanHandoffEnabled}
                onCheckedChange={(v) => setForm({ ...form, humanHandoffEnabled: v })}
                label="Transferência para humano"
              />
              <Checkbox
                checked={form.followUpEnabled}
                onCheckedChange={(v) => setForm({ ...form, followUpEnabled: v })}
                label="Follow-up"
              />
              <Checkbox
                checked={form.remindersEnabled}
                onCheckedChange={(v) => setForm({ ...form, remindersEnabled: v })}
                label="Lembretes"
              />
              <div>
                <p className="mb-2 text-sm font-medium">Imóveis autorizados</p>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {properties.map((p) => (
                    <Checkbox
                      key={p.id}
                      checked={form.authorizedPropertyIds.includes(p.id)}
                      onCheckedChange={(checked) => {
                        setForm((prev) => ({
                          ...prev,
                          authorizedPropertyIds: checked
                            ? [...prev.authorizedPropertyIds, p.id]
                            : prev.authorizedPropertyIds.filter((id) => id !== p.id),
                        }))
                      }}
                      label={p.title}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={save}>Salvar configuração</Button>
            </div>
          ) : null}
        </AiPageState>
      </div>
    </div>
  )
}
