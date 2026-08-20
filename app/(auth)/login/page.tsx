'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { Eye, EyeOff } from 'lucide-react'
import { ensureCleanDevSeed, loginApp } from '@/lib/auth'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('corretor@plataforma.com.br')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hintAdmin, setHintAdmin] = useState(false)

  useEffect(() => {
    ensureCleanDevSeed()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setHintAdmin(false)
    setLoading(true)
    setTimeout(() => {
      const result = loginApp(email, password)
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        setHintAdmin(!!result.hintAdmin)
        return
      }
      void rememberMe
      const next = params.get('next')
      router.push(next || result.redirectTo)
    }, 500)
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-center">
        <img src="/logo.png" alt="ImóvelHub" className="h-16 w-16 rounded-lg shadow-lg" />
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-foreground">Acesso à plataforma</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Entre na sua conta de corretor para gerenciar imóveis, clientes e negociações
        </p>

        {error ? (
          <Alert variant="destructive" title="Não foi possível entrar" description={error} className="mb-6" />
        ) : null}

        {hintAdmin ? (
          <Alert
            variant="info"
            className="mb-6"
            title="Ambiente administrativo"
            description="Contas Super Admin devem usar /admin/login."
          />
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">E-mail</label>
            <Input
              type="email"
              placeholder="corretor@plataforma.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
              <label htmlFor="remember" className="cursor-pointer text-sm text-foreground">
                Lembrar-me
              </label>
            </div>
            <Link href="/esqueci-senha" className="text-sm text-primary hover:text-primary/80">
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/cadastro" className="font-medium text-primary hover:text-primary/80">
              Criar conta
            </Link>
          </div>
        </form>

        <div className="mt-8 rounded-lg border border-info bg-info/10 p-4">
          <p className="mb-2 text-xs font-medium text-info">Demonstração (desenvolvimento)</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>
              Corretor: <span className="text-foreground">corretor@plataforma.com.br</span> / Corretor@123456
            </li>
            <li>
              Admin: use <Link href="/admin/login" className="text-primary underline">/admin/login</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Carregando…</p>}>
      <LoginForm />
    </Suspense>
  )
}
