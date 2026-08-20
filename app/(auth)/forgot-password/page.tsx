'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>(
    'email'
  )
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (email) {
        setStep('code')
      } else {
        setError('Por favor, insira seu email')
      }
      setLoading(false)
    }, 1000)
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      if (code) {
        setStep('password')
      } else {
        setError('Por favor, insira o código')
      }
      setLoading(false)
    }, 1000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('As senhas não correspondem')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setStep('success')
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
        {step === 'email' && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
              Recuperar Senha
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Insira seu email para receber instruções
            </p>

            {error && (
              <Alert
                variant="destructive"
                title="Erro"
                description={error}
                className="mb-6"
              />
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o acesso
              </Link>
            </form>
          </>
        )}

        {step === 'code' && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
              Verificar Código
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Insira o código enviado para {email}
            </p>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Código de Verificação
                </label>
                <Input
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="bg-info/10 border border-info rounded-lg p-3">
                <p className="text-xs text-info">
                  Código de demonstração: <span className="font-bold">123456</span>
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-sm text-primary hover:text-primary/80"
              >
                Usar outro email
              </button>
            </form>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
              Nova Senha
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Digite sua nova senha
            </p>

            {error && (
              <Alert
                variant="destructive"
                title="Erro"
                description={error}
                className="mb-6"
              />
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nova Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirmar Senha
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-success">✔</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Senha Alterada!
            </h1>
            <p className="text-muted-foreground mb-8">
              Sua senha foi alterada com sucesso. Você pode fazer login agora.
            </p>

            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                Ir para o acesso
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
