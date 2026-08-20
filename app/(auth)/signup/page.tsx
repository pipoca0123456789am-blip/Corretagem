'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'basic' | 'verification' | 'complete'>(
    'basic'
  )
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não correspondem')
      return
    }

    if (!agreedToTerms) {
      setError('Você deve concordar com os termos e condições')
      return
    }

    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('pendingSignup', JSON.stringify(formData))
      setStep('verification')
      setLoading(false)
    }, 1000)
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', formData.email)
      setStep('complete')
      setTimeout(() => {
        router.push('/onboarding')
      }, 1500)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="ImóvelHub" className="w-16 h-16 rounded-lg shadow-lg" />
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl shadow-lg p-8">
        {step === 'basic' && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
              Criar Conta
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Junte-se à plataforma ImóvelHub
            </p>

            {error && (
              <Alert
                variant="destructive"
                title="Erro"
                description={error}
                className="mb-6"
              />
            )}

            <form onSubmit={handleBasicSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primeiro Nome
                  </label>
                  <Input
                    placeholder="João"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
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
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirmar Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground cursor-pointer mt-1"
                >
                  Concordo com os{' '}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                  >
                    Termos de Serviço
                  </Link>{' '}
                  e{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Criando Conta...' : 'Criar Conta'}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Entrar
                </Link>
              </div>
            </form>
          </>
        )}

        {step === 'verification' && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
              Verificar e-mail
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Enviamos um código para {formData.email}
            </p>

            <form onSubmit={handleVerification} className="space-y-6">
              <div className="bg-info/10 border border-info rounded-lg p-4">
                <p className="text-sm text-foreground text-center">
                  Código: <span className="font-bold">123456</span>
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar e Continuar'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('basic')}
                className="w-full text-center text-sm text-primary hover:text-primary/80"
              >
                Voltar
              </button>
            </form>
          </>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-success">✔</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Conta Criada!
            </h1>
            <p className="text-muted-foreground mb-8">
              Sua conta foi criada com sucesso. Redirecionando para onboarding...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
