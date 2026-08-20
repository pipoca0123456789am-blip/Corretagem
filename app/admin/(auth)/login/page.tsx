'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { canAccessAdminRealm, ensureCleanDevSeed, loginAdmin } from '@/lib/auth'

function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('admin@plataforma.com.br')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ensureCleanDevSeed()
    if (canAccessAdminRealm()) {
      router.replace(params.get('next') || '/admin/dashboard')
    }
  }, [router, params])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = loginAdmin(email, password)
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      void remember
      router.replace(params.get('next') || '/admin/dashboard')
    }, 400)
  }

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <Shield className="h-7 w-7" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <h1 className="text-center text-2xl font-bold text-white">Acesso Administrativo</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Ambiente restrito — Super Admin da plataforma
        </p>

        <Alert
          className="mt-6"
          variant="warning"
          title="Acesso restrito"
          description="Somente contas administrativas. Tentativas são registradas para auditoria (simulado)."
        />

        {error ? (
          <Alert className="mt-4" variant="destructive" title="Não autorizado" description={error} />
        ) : null}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@plataforma.com.br"
              disabled={loading}
              className="border-slate-700 bg-slate-950 text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="border-slate-700 bg-slate-950 pr-10 text-white"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember-admin" checked={remember} onCheckedChange={setRemember} />
              <label htmlFor="remember-admin" className="text-sm text-slate-300">
                Lembrar acesso
              </label>
            </div>
            <Link href="/admin/esqueci-senha" className="text-sm text-amber-400 hover:underline">
              Recuperar senha
            </Link>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Validando…' : 'Entrar no Super Admin'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Segurança: não compartilhe credenciais. Desenvolvimento apenas — altere antes da produção.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-slate-400">Carregando…</p>}>
      <AdminLoginForm />
    </Suspense>
  )
}
