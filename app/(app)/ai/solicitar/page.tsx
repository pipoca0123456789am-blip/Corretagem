'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Select } from '@/components/design-system/forms/select'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Progress } from '@/components/design-system/feedback/progress'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'
import {
  AI_INTEGRATION_PRICE,
  AI_PRICE_PROVISIONAL,
  AiAgentConfig,
  createAiDraft,
  emptyAgentForm,
  formatCurrency,
  getCurrentRealtorId,
  getRealtorAi,
  getRealtorProperties,
  styleOptions,
  toneOptions,
  upsertAi,
} from '@/lib/phase13-data'
import { publicRealtorProfiles } from '@/lib/phase9-data'

const steps = [
  'WhatsApp',
  'Agente',
  'Mensagens e regras',
  'Base e imóveis',
  'Follow-up',
  'Resumo',
]

export default function AiRequestPage() {
  const router = useRouter()
  const realtorId = getCurrentRealtorId() || 1
  const profile = publicRealtorProfiles.find((p) => p.id === realtorId)
  const properties = getRealtorProperties(realtorId)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<AiAgentConfig>(emptyAgentForm(realtorId))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const existing = getRealtorAi(realtorId)
    setForm(existing?.config || emptyAgentForm(realtorId))
  }, [realtorId])

  const progress = Math.round(((step + 1) / steps.length) * 100)

  const toggleProperty = (id: string) => {
    setForm((prev) => ({
      ...prev,
      authorizedPropertyIds: prev.authorizedPropertyIds.includes(id)
        ? prev.authorizedPropertyIds.filter((x) => x !== id)
        : [...prev.authorizedPropertyIds, id],
    }))
  }

  const next = () => {
    setError('')
    if (step === 0 && !form.whatsappNumber) {
      setError('Informe o WhatsApp do corretor.')
      return
    }
    if (step === 1 && !form.name) {
      setError('Defina o nome do agente.')
      return
    }
    setSuccess('Etapa salva visualmente.')
    setTimeout(() => setSuccess(''), 1200)
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const submit = () => {
    const draft = createAiDraft(realtorId, profile?.name || 'Corretor')
    upsertAi({
      ...draft,
      config: form,
      status: 'aguardando_pagamento',
      paymentStatus: 'pendente',
      updatedAt: new Date().toISOString().slice(0, 10),
      history: [
        {
          id: `h-${Date.now()}`,
          label: 'Formulário de configuração enviado',
          at: new Date().toLocaleString('pt-BR'),
        },
        ...draft.history,
      ],
    })
    setSuccess('Solicitação registrada. Seguindo ao checkout visual.')
    setTimeout(() => router.push('/ai/checkout'), 700)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'IA WhatsApp', href: '/ai' }, { label: 'Solicitação' }]} />
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formulário de solicitação</h1>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(AI_INTEGRATION_PRICE)}
            {AI_PRICE_PROVISIONAL ? ' · valor provisório' : ''} · agente isolado da sua carteira
          </p>
        </div>

        <Progress value={progress} label={`Etapa ${step + 1}/${steps.length}: ${steps[step]}`} />
        <div className="flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <Badge key={label} variant={index === step ? 'primary' : index < step ? 'success' : 'default'}>
              {label}
            </Badge>
          ))}
        </div>

        {error ? <Alert variant="destructive" description={error} /> : null}
        {success ? <Alert variant="success" description={success} /> : null}

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          {step === 0 && (
            <>
              <Alert variant="info" description="Conexão WhatsApp é conceitual — sem integração real." />
              <Input
                label="Número WhatsApp"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              />
              <Input
                label="Rótulo / exibição"
                value={form.whatsappLabel}
                onChange={(e) => setForm({ ...form, whatsappLabel: e.target.value })}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Input label="Nome do agente" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input
                label="Foto / avatar (upload simulado)"
                type="file"
                onChange={() => setForm({ ...form, avatar: form.avatar || 'avatar-agente.jpg' })}
              />
              <Select
                label="Tom de voz"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                options={toneOptions}
              />
              <Select
                label="Estilo de comunicação"
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
                options={styleOptions}
              />
              <Input
                label="Horários de atendimento"
                value={form.businessHours}
                onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
              />
            </>
          )}

          {step === 2 && (
            <>
              <Textarea
                label="Mensagem de boas-vindas"
                value={form.welcomeMessage}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
              />
              <Textarea
                label="Mensagem fora do horário"
                value={form.offlineMessage}
                onChange={(e) => setForm({ ...form, offlineMessage: e.target.value })}
              />
              <Textarea
                label="Regras de resposta"
                value={form.responseRules}
                onChange={(e) => setForm({ ...form, responseRules: e.target.value })}
              />
              <Textarea
                label="Limites de atuação"
                value={form.limits}
                onChange={(e) => setForm({ ...form, limits: e.target.value })}
              />
              <Textarea
                label="Perguntas frequentes (uma por linha)"
                value={form.faqs.join('\n')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    faqs: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </>
          )}

          {step === 3 && (
            <>
              <Textarea
                label="Base de conhecimento (uma por linha)"
                value={form.knowledgeBase.join('\n')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    knowledgeBase: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <div>
                <p className="mb-2 text-sm font-medium">Imóveis autorizados (somente sua carteira)</p>
                <div className="max-h-56 space-y-2 overflow-y-auto">
                  {properties.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Você ainda não possui imóveis cadastrados.</p>
                  ) : (
                    properties.map((p) => (
                      <Checkbox
                        key={p.id}
                        checked={form.authorizedPropertyIds.includes(p.id)}
                        onCheckedChange={() => toggleProperty(p.id)}
                        label={`${p.title} · ${p.neighborhood}`}
                      />
                    ))
                  )}
                </div>
              </div>
              <Checkbox
                checked={form.humanHandoffEnabled}
                onCheckedChange={(v) => setForm({ ...form, humanHandoffEnabled: v })}
                label="Permitir transferência para atendimento humano"
              />
              <Textarea
                label="Palavras que exigem intervenção (vírgula)"
                value={form.triggerWords.join(', ')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    triggerWords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </>
          )}

          {step === 4 && (
            <>
              <Checkbox
                checked={form.followUpEnabled}
                onCheckedChange={(v) => setForm({ ...form, followUpEnabled: v })}
                label="Ativar follow-up automático"
              />
              <Input
                label="Horas para follow-up"
                type="number"
                value={String(form.followUpHours)}
                onChange={(e) => setForm({ ...form, followUpHours: Number(e.target.value) || 24 })}
              />
              <Checkbox
                checked={form.remindersEnabled}
                onCheckedChange={(v) => setForm({ ...form, remindersEnabled: v })}
                label="Ativar lembretes de visita"
              />
            </>
          )}

          {step === 5 && (
            <div className="space-y-2 text-sm">
              <h2 className="text-lg font-semibold">Resumo</h2>
              <p><strong>Agente:</strong> {form.name}</p>
              <p><strong>WhatsApp:</strong> {form.whatsappLabel || form.whatsappNumber}</p>
              <p><strong>Tom / estilo:</strong> {form.tone} · {form.style}</p>
              <p><strong>Imóveis autorizados:</strong> {form.authorizedPropertyIds.length}</p>
              <p><strong>Handoff humano:</strong> {form.humanHandoffEnabled ? 'Sim' : 'Não'}</p>
              <p>
                <strong>Valor:</strong> {formatCurrency(AI_INTEGRATION_PRICE)}
                {AI_PRICE_PROVISIONAL ? ' (provisório)' : ''}
              </p>
              <Alert
                variant="warning"
                description="Sem pagamento, IA ou WhatsApp reais. O agente permanece isolado a este corretor."
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Voltar
            </Button>
            <Link href="/ai"><Button variant="tertiary">Cancelar</Button></Link>
          </div>
          {step < steps.length - 1 ? (
            <Button onClick={next}>Salvar e continuar</Button>
          ) : (
            <Button onClick={submit}>Ir ao checkout</Button>
          )}
        </div>
      </div>
    </div>
  )
}
