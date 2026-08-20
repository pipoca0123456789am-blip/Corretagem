'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  PROFESSIONAL_PAGE_PRICE,
  ProfessionalRequestForm,
  createDraftRequest,
  emptyForm,
  formatCurrency,
  getCurrentRealtorId,
  getRealtorProfessionalRequest,
  regionOptions,
  specialtyOptions,
  upsertProfessionalRequest,
  visualModels,
} from '@/lib/phase12-data'
import { publicRealtorProfiles } from '@/lib/phase9-data'

const steps = [
  'Dados profissionais',
  'Biografia e mídia',
  'Redes e posicionamento',
  'Modelo e slug',
  'Materiais',
  'Resumo',
]

export default function ProfessionalRequestFormPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando formulário...</div>}>
      <ProfessionalRequestFormInner />
    </Suspense>
  )
}

function ProfessionalRequestFormInner() {
  const router = useRouter()
  const params = useSearchParams()
  const realtorId = getCurrentRealtorId() || 1
  const profile = publicRealtorProfiles.find((p) => p.id === realtorId)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ProfessionalRequestForm>(emptyForm(realtorId))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const existing = getRealtorProfessionalRequest(realtorId)
    if (existing) setForm(existing.form)
    else setForm(emptyForm(realtorId))
    const model = params.get('modelo')
    if (model) setForm((prev) => ({ ...prev, modelId: model }))
  }, [realtorId, params])

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step])
  const model = visualModels.find((m) => m.id === form.modelId)

  const toggleList = (key: 'specialties' | 'regions', value: string) => {
    setForm((prev) => {
      const list = prev[key]
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })
  }

  const next = () => {
    setError('')
    if (step === 0 && (!form.fullName || !form.creci || !form.email)) {
      setError('Preencha nome, CRECI e e-mail.')
      return
    }
    if (step === 1 && !form.bio) {
      setError('Informe a biografia.')
      return
    }
    if (step === 3 && !form.slug) {
      setError('Escolha um slug para a página.')
      return
    }
    setSuccess('Etapa salva visualmente.')
    setTimeout(() => setSuccess(''), 1500)
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const submit = () => {
    const draft = createDraftRequest(realtorId, profile?.name || form.fullName)
    const materials = []
    if (form.photoName) {
      materials.push({ id: 'photo', name: form.photoName, type: 'Foto', status: 'enviado' as const })
    }
    if (form.logoName) {
      materials.push({ id: 'logo', name: form.logoName, type: 'Logotipo', status: 'enviado' as const })
    }
    const updated = {
      ...draft,
      form,
      status: 'aguardando_pagamento' as const,
      paymentStatus: 'pendente' as const,
      updatedAt: new Date().toISOString().slice(0, 10),
      materials,
      timeline: [
        ...draft.timeline,
        {
          id: `t-${Date.now()}`,
          status: 'aguardando_pagamento' as const,
          label: 'Formulário enviado — aguardando pagamento',
          at: new Date().toLocaleString('pt-BR'),
        },
      ],
    }
    upsertProfessionalRequest(updated)
    setSuccess('Solicitação registrada. Seguindo para o checkout visual.')
    setTimeout(() => router.push('/professional/checkout'), 700)
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Pág. Profissional', href: '/professional' },
          { label: 'Solicitação' },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Formulário de solicitação</h1>
          <p className="text-sm text-muted-foreground">
            Serviço {formatCurrency(PROFESSIONAL_PAGE_PRICE)} · progresso salvo a cada etapa
          </p>
        </div>

        <Progress value={progress} label={`Etapa ${step + 1} de ${steps.length}: ${steps[step]}`} />
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
              <Input label="Nome profissional" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <Input label="CRECI" value={form.creci} onChange={(e) => setForm({ ...form, creci: e.target.value })} />
              <Input label="Telefone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </>
          )}

          {step === 1 && (
            <>
              <Textarea label="Biografia" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              <Input
                label="Foto (upload simulado)"
                type="file"
                onChange={(e) =>
                  setForm({ ...form, photoName: e.target.files?.[0]?.name || 'foto-perfil.jpg' })
                }
              />
              {form.photoName ? <p className="text-xs text-muted-foreground">Arquivo: {form.photoName}</p> : null}
              <Input
                label="Logotipo (upload simulado)"
                type="file"
                onChange={(e) =>
                  setForm({ ...form, logoName: e.target.files?.[0]?.name || 'logo.png' })
                }
              />
              {form.logoName ? <p className="text-xs text-muted-foreground">Arquivo: {form.logoName}</p> : null}
              <Input label="URL do vídeo" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://..." />
            </>
          )}

          {step === 2 && (
            <>
              <Input label="Instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
              <Input label="Facebook" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
              <Input label="LinkedIn" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
              <Input label="YouTube" value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} />
              <div>
                <p className="mb-2 text-sm font-medium">Especialidades</p>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleList('specialties', item)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        form.specialties.includes(item)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Regiões</p>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleList('regions', item)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        form.regions.includes(item)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                label="Depoimentos (um por linha)"
                value={form.testimonials}
                onChange={(e) => setForm({ ...form, testimonials: e.target.value })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Cor principal desejada" type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
                <Input label="Cor secundária" type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Select
                label="Escolha de modelo"
                value={form.modelId}
                onChange={(e) => setForm({ ...form, modelId: e.target.value })}
                options={visualModels.map((m) => ({ value: m.id, label: `${m.name} — ${m.style}` }))}
              />
              {model ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <img src={model.image} alt={model.name} className="h-40 w-full object-cover" />
                  <p className="p-3 text-sm text-muted-foreground">{model.description}</p>
                </div>
              ) : null}
              <Input label="Slug desejado" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} hint={`Resultado: /corretor/${form.slug || 'seu-slug'}`} />
              <Checkbox
                checked={form.wantsDomain}
                onCheckedChange={(v) => setForm({ ...form, wantsDomain: v })}
                label="Solicitar domínio próprio"
              />
              {form.wantsDomain ? (
                <Input
                  label="Domínio desejado"
                  value={form.customDomain}
                  onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                  placeholder="meusite.com.br"
                />
              ) : null}
            </>
          )}

          {step === 4 && (
            <>
              <Alert
                variant="info"
                title="Upload simulado"
                description="Nenhum arquivo é enviado de verdade nesta fase. Informe os nomes dos materiais."
              />
              <Input
                label="Materiais adicionais"
                type="file"
                onChange={() =>
                  setForm({
                    ...form,
                    materialsNote: form.materialsNote || 'Pacote de imagens enviado (simulado)',
                  })
                }
              />
              <Textarea
                label="Observações sobre materiais"
                value={form.materialsNote}
                onChange={(e) => setForm({ ...form, materialsNote: e.target.value })}
              />
            </>
          )}

          {step === 5 && (
            <div className="space-y-3 text-sm">
              <h2 className="text-lg font-semibold text-foreground">Resumo do pedido</h2>
              <p><strong>Nome:</strong> {form.fullName}</p>
              <p><strong>CRECI:</strong> {form.creci}</p>
              <p><strong>Modelo:</strong> {model?.name}</p>
              <p><strong>Slug:</strong> /corretor/{form.slug}</p>
              <p><strong>Domínio:</strong> {form.wantsDomain ? form.customDomain || 'A definir' : 'Não solicitado'}</p>
              <p><strong>Especialidades:</strong> {form.specialties.join(', ') || '—'}</p>
              <p><strong>Regiões:</strong> {form.regions.join(', ') || '—'}</p>
              <p><strong>Valor:</strong> {formatCurrency(PROFESSIONAL_PAGE_PRICE)}</p>
              <Alert
                variant="warning"
                title="Próximo passo"
                description="Após confirmar, você seguirá para o checkout visual (sem cobrança real)."
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Voltar
            </Button>
            <Link href="/professional">
              <Button variant="tertiary">Cancelar</Button>
            </Link>
          </div>
          {step < steps.length - 1 ? (
            <Button onClick={next}>Salvar e continuar</Button>
          ) : (
            <Button onClick={submit}>Confirmar e ir ao checkout</Button>
          )}
        </div>
      </div>
    </div>
  )
}
