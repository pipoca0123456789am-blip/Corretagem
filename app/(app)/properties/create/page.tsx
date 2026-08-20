'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Progress } from '@/components/design-system/feedback/progress'
import { Alert } from '@/components/design-system/feedback/alert'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { addExtraSiteProperty, SitePublishChoice } from '@/lib/meu-site-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { getMeuSiteSettings } from '@/lib/meu-site-data'
import { canCreateActiveProperty } from '@/lib/phase14-data'

export default function CreatePropertyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 9
  const progress = (step / totalSteps) * 100
  const [doneMsg, setDoneMsg] = useState('')
  const [limitError, setLimitError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    type: 'apartment',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: '',
    pricePerSqm: '',
    bedrooms: '',
    bathrooms: '',
    garage: '',
    area: '',
    features: [] as string[],
    highlights: '',
    images: [] as string[],
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    realtorId: '',
    status: 'ready',
    sitePublish: 'yes' as SitePublishChoice,
    purpose: 'venda' as 'venda' | 'aluguel' | 'lancamento',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    const realtorId = getCurrentRealtorId() ?? (Number(formData.realtorId) || 1)
    const publish = formData.sitePublish
    if (publish === 'yes') {
      const check = canCreateActiveProperty(realtorId)
      if (!check.ok) {
        setLimitError(check.message)
        return
      }
    }
    setLimitError('')
    const entry = addExtraSiteProperty({
      realtorId,
      title: formData.title || 'Novo imóvel',
      address: formData.address || formData.city || 'São Paulo',
      neighborhood: formData.address.split(',')[0] || formData.city || '',
      city: formData.city || 'São Paulo',
      price: Number(formData.price) || 0,
      purpose: formData.purpose,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      area: Number(formData.area) || 0,
      garage: Number(formData.garage) || 0,
      image: '',
      description: formData.description || formData.highlights || '',
      publish,
    })
    const slug = getMeuSiteSettings(realtorId).slug
    if (publish === 'yes') {
      setDoneMsg(`Imóvel publicado no seu site. Link: /${slug}/imovel/${entry.slug}`)
    } else if (publish === 'draft') {
      setDoneMsg('Imóvel salvo como rascunho — não aparece no site.')
    } else {
      setDoneMsg('Imóvel cadastrado, mas não publicado no site.')
    }
    setTimeout(() => router.push('/properties'), 1800)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="p-4 md:p-6">
        <Breadcrumbs
          items={[
            { label: 'Painel', href: '/dashboard' },
            { label: 'Imóveis', href: '/properties' },
            { label: 'Novo Imóvel', href: '/properties/create' },
          ]}
        />

        <div className="mt-6 mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Criar Novo Imóvel</h1>
          <p className="text-muted-foreground">Passo {step} de {totalSteps}</p>
        </div>

        <Progress value={progress} className="mb-8" />

        {doneMsg ? <Alert className="mb-4" variant="success" description={doneMsg} /> : null}
        {limitError ? (
          <Alert
            className="mb-4"
            variant="warning"
            title="Limite do plano"
            description={limitError}
          />
        ) : null}

        <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Identificação do Imóvel</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Título</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Apartamento Luxo Vila Mariana"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground"
                >
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Finalidade</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground"
                >
                  <option value="venda">Comprar / Venda</option>
                  <option value="aluguel">Alugar</option>
                  <option value="lancamento">Lançamento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o imóvel"
                  rows={4}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Localização</h2>
              <Input name="address" value={formData.address} onChange={handleChange} placeholder="Endereço / Bairro" />
              <Input name="city" value={formData.city} onChange={handleChange} placeholder="Cidade" />
              <div className="grid grid-cols-2 gap-4">
                <Input name="state" value={formData.state} onChange={handleChange} placeholder="Estado" />
                <Input name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="CEP" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Valores</h2>
              <Input name="price" value={formData.price} onChange={handleChange} placeholder="Preço total (R$)" />
              <Input name="pricePerSqm" value={formData.pricePerSqm} onChange={handleChange} placeholder="Preço por m²" />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Características</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input name="bedrooms" value={formData.bedrooms} onChange={handleChange} placeholder="Quartos" />
                <Input name="bathrooms" value={formData.bathrooms} onChange={handleChange} placeholder="Banheiros" />
                <Input name="garage" value={formData.garage} onChange={handleChange} placeholder="Garagens" />
                <Input name="area" value={formData.area} onChange={handleChange} placeholder="Área (m²)" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Conteúdo</h2>
              <Textarea name="highlights" value={formData.highlights} onChange={handleChange} placeholder="Destaques do imóvel" rows={4} />
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Mídias</h2>
              <Alert variant="info" title="Mídias" description="Sistema de upload de imagens em desenvolvimento" />
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Proprietário</h2>
              <Input name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Nome do proprietário" />
              <Input name="ownerEmail" value={formData.ownerEmail} onChange={handleChange} placeholder="E-mail" />
              <Input name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="Telefone" />
            </div>
          )}

          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Responsável</h2>
              <Alert
                variant="info"
                description="O imóvel fica vinculado à sua carteira. Isolamento por corretor é aplicado automaticamente."
              />
              <select
                name="realtorId"
                value={formData.realtorId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground"
              >
                <option value="">Usar corretor da sessão</option>
                <option value="1">Corretor da conta</option>
              </select>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-6">Publicação no Meu Site</h2>
              <p className="text-sm text-muted-foreground">
                Publicar este imóvel automaticamente na sua vitrine pública (incluída na assinatura)?
              </p>
              <div className="grid gap-3">
                {(
                  [
                    { value: 'yes', title: 'SIM — Publicar no meu site', desc: 'Aparece imediatamente na vitrine e gera página individual.' },
                    { value: 'no', title: 'NÃO — Não publicar', desc: 'Fica só no painel, fora do site público.' },
                    { value: 'draft', title: 'Rascunho', desc: 'Salva sem exibir no site até você publicar.' },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex cursor-pointer flex-col rounded-lg border p-4 ${
                      formData.sitePublish === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <input
                        type="radio"
                        name="sitePublish"
                        value={opt.value}
                        checked={formData.sitePublish === opt.value}
                        onChange={handleChange}
                      />
                      {opt.title}
                    </span>
                    <span className="mt-1 pl-6 text-sm text-muted-foreground">{opt.desc}</span>
                  </label>
                ))}
              </div>
              <Alert
                variant="info"
                title="Meu Site ≠ Página Premium"
                description="A publicação alimenta o site automático da assinatura. A Página Profissional Premium (R$ 497) continua disponível em Minha página."
              />
            </div>
          )}

          <div className="flex gap-4 mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrev} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
            )}
            {step < totalSteps ? (
              <Button variant="primary" onClick={handleNext} className="gap-2 ml-auto">
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} className="ml-auto">
                Criar Imóvel
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href="/meu-site" className="text-sm text-primary hover:underline">
            Abrir módulo Meu Site
          </Link>
        </div>
      </div>
    </main>
  )
}
