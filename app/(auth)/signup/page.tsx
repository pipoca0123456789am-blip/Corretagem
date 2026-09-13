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
  const [step, setStep] = useState<'basic' | 'verification' | 'complete'>('basic')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Informe nome e sobrenome')
      return
    }
    if (!formData.email.trim()) {
      setError('Informe o e-mail')
      return
    }
    if (formData.password.length < 10) {
      setError('A senha deve ter pelo menos 10 caracteres')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não correspondem')
      return
    }
    if (!agreedToTerms) {
      setError('Você deve concordar com os termos e condições')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })
      let data: {
        ok?: boolean
        error?: string
        pendingVerification?: boolean
        devOtp?: string
        message?: string
      } = {}
      try {
        data = (await res.json()) as typeof data
      } catch {
        setError(
          res.status >= 500
            ? 'Servidor indisponível (configuração). Tente novamente em instantes.'
            : 'Resposta inválida do servidor. Tente novamente.'
        )
        return
      }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Não foi possível criar a conta')
        return
      }
      if (data.devOtp) setDevOtp(data.devOtp)
      setStep('verification')
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) {
      setError('Informe o código enviado ao seu e-mail')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otp.trim() }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; redirectTo?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Código inválido')
        return
      }
      setStep('complete')
      setTimeout(() => {
        router.push(data.redirectTo || '/onboarding')
        router.refresh()
      }, 800)
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-center">
        <img src="/logo.png" alt="ImóvelHub" className="h-16 w-16 rounded-lg shadow-lg" />
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
        {step === 'basic' && (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Criar Conta</h1>
            <p className="mb-8 text-center text-muted-foreground">Junte-se à plataforma ImóvelHub</p>

            {error ? (
              <Alert variant="destructive" title="Erro" description={error} className="mb-6" />
            ) : null}

            <form onSubmit={handleBasicSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Primeiro Nome</label>
                  <Input
                    placeholder="João"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Sobrenome</label>
                  <Input
                    placeholder="Silva"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Senha</label>
                <Input
                  type="password"
                  placeholder="Mínimo 10 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                />
                <p className="mt-1 text-xs text-muted-foreground">Mínimo 10 caracteres · evite senhas comuns</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Confirmar Senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={setAgreedToTerms} />
                <label htmlFor="terms" className="mt-1 cursor-pointer text-sm text-muted-foreground">
                  Concordo com os{' '}
                  <Link href="/termos" className="text-primary hover:underline">
                    Termos de Serviço
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </label>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Criando Conta...' : 'Criar Conta'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta? </span>
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  Entrar
                </Link>
              </div>
            </form>
          </>
        )}

        {step === 'verification' && (
          <>
            <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Verificar e-mail</h1>
            <p className="mb-8 text-center text-muted-foreground">
              Enviamos um código para {formData.email}
            </p>

            {error ? (
              <Alert variant="destructive" title="Erro" description={error} className="mb-6" />
            ) : null}

            {devOtp ? (
              <div className="mb-4 rounded-lg border border-info bg-info/10 p-4">
                <p className="text-center text-sm text-foreground">
                  Código (dev): <span className="font-bold">{devOtp}</span>
                </p>
              </div>
            ) : null}

            <form onSubmit={handleVerification} className="space-y-6">
              <Input
                label="Código de verificação"
                placeholder="6 dígitos"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
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
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <span className="text-3xl font-bold text-success">✔</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Conta verificada</h1>
            <p className="mb-8 text-muted-foreground">Redirecionando para o onboarding…</p>
          </div>
        )}
      </div>
    </div>
  )
}
