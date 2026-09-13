'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Badge } from '@/components/design-system/feedback/badge'

const steps = [
  { id: 1, title: 'Dados Pessoais', description: 'Informações básicas' },
  { id: 2, title: 'Dados Profissionais', description: 'Experiência' },
  { id: 3, title: 'CRECI', description: 'Registro profissional' },
  { id: 4, title: 'Região', description: 'Área de atuação' },
  { id: 5, title: 'Especialidades', description: 'Nichos' },
  { id: 6, title: 'Objetivos', description: 'Metas' },
  { id: 7, title: 'Plano', description: 'Escolha seu plano' },
  { id: 8, title: 'Confirmação', description: 'Pronto!' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    phone: '',
    // Step 2
    yearsExperience: '',
    properties: '',
    // Step 3
    createdNumber: '',
    documentType: 'creci',
    // Step 4
    states: [] as string[],
    // Step 5
    specialties: [] as string[],
    // Step 6
    objectives: [] as string[],
    // Step 7
    plan: '',
  })

  const handleNext = async () => {
    setLoading(true)
    setTimeout(() => {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
      setLoading(false)
    }, 800)
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
      setLoading(false)
    }, 1000)
  }

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item]
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <img src="/logo.png" alt="ImóvelHub" className="w-12 h-12 rounded-lg mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao ImóvelHub
          </h1>
          <p className="text-muted-foreground">
            Vamos configurar seu perfil em {steps.length} passos
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 px-2 py-2 text-center rounded-lg transition-colors mx-1 ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.id
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="text-xs font-bold">{step.id}</span>
              </button>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-8 mb-6">
          {/* Step 1: Personal Data */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primeiro Nome
                  </label>
                  <Input
                    placeholder="João"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sobrenome
                  </label>
                  <Input
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Telefone
                </label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Professional Data */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Anos de Experiência
                </label>
                <Input
                  type="number"
                  placeholder="5"
                  value={formData.yearsExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsExperience: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Imóveis Vendidos
                </label>
                <Input
                  type="number"
                  placeholder="150"
                  value={formData.properties}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      properties: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 3: CRECI */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Documento
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="creci"
                      name="documentType"
                      value="creci"
                      checked={formData.documentType === 'creci'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentType: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="creci" className="text-sm text-foreground cursor-pointer">
                      CRECI
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="creci-f"
                      name="documentType"
                      value="creci-f"
                      checked={formData.documentType === 'creci-f'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          documentType: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="creci-f" className="text-sm text-foreground cursor-pointer">
                      CRECI (Pessoa Física)
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Número do CRECI
                </label>
                <Input
                  placeholder="123456"
                  value={formData.createdNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      createdNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 4: Region */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Selecione os Estados
              </label>
              <div className="space-y-2">
                {[
                  'São Paulo',
                  'Rio de Janeiro',
                  'Minas Gerais',
                  'Bahia',
                  'Outros',
                ].map((state) => (
                  <div key={state} className="flex items-center gap-2">
                    <Checkbox
                      id={state}
                      checked={formData.states.includes(state)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          states: toggleArrayItem(formData.states, state),
                        })
                      }
                    />
                    <label htmlFor={state} className="text-sm text-foreground cursor-pointer">
                      {state}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Specialties */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Especialidades
              </label>
              <div className="space-y-2">
                {[
                  'Residencial',
                  'Comercial',
                  'Terrenos',
                  'Aluguel',
                  'Industriais',
                ].map((specialty) => (
                  <div key={specialty} className="flex items-center gap-2">
                    <Checkbox
                      id={specialty}
                      checked={formData.specialties.includes(specialty)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          specialties: toggleArrayItem(
                            formData.specialties,
                            specialty
                          ),
                        })
                      }
                    />
                    <label
                      htmlFor={specialty}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {specialty}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Objectives */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Seus Objetivos
              </label>
              <div className="space-y-2">
                {[
                  'Aumentar Vendas',
                  'Gerenciar Equipe',
                  'Análise de Dados',
                  'Automatizar Processos',
                ].map((objective) => (
                  <div key={objective} className="flex items-center gap-2">
                    <Checkbox
                      id={objective}
                      checked={formData.objectives.includes(objective)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          objectives: toggleArrayItem(
                            formData.objectives,
                            objective
                          ),
                        })
                      }
                    />
                    <label
                      htmlFor={objective}
                      className="text-sm text-foreground cursor-pointer"
                    >
                      {objective}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Plan */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Escolha seu Plano
              </label>
              <div className="space-y-3">
                {[
                  { id: 'starter', name: 'Essencial', price: 'R$ 69,90/mês' },
                  { id: 'professional', name: 'Profissional', price: 'R$ 149,90/mês' },
                  { id: 'premium', name: 'Premium', price: 'R$ 299,90/mês' },
                  { id: 'enterprise', name: 'Empresarial', price: 'Sob consulta' },
                ].map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={formData.plan === plan.id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plan: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {plan.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.price}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Confirmation */}
          {currentStep === 8 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-success">✔</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Tudo Pronto!
              </h2>
              <p className="text-muted-foreground mb-6">
                Sua conta foi configurada com sucesso. Agora você pode acessar
                o painel e começar a usar a plataforma.
              </p>
              <Alert
                variant="success"
                title="Bem-vindo!"
                description="Sua jornada com ImóvelHub está apenas começando"
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || loading}
          >
            Anterior
          </Button>

          {currentStep < steps.length ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? 'Próximo...' : 'Próximo'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={loading}
            >
              {loading ? 'Finalizando...' : 'Ir para o painel'}
            </Button>
          )}
        </div>

        {/* Step Counter */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Passo {currentStep} de {steps.length}
        </div>
      </div>
    </div>
  )
}
