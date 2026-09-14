'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { isDevSeedUiEnabled } from '@/lib/auth-public'

function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const showSeed = isDevSeedUiEnabled()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)

  useEffect(() => {
    if (showSeed) setEmail('admin@plataforma.com.br')
    fetch('/api/auth/me?realm=admin')
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok && data.realm === 'admin') {
          router.replace('/paineladmin')
        }
      })
      .catch(() => undefined)
  }, [router, showSeed])

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          next: params.get('next') || undefined,
        }),
      })
      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        redirectTo?: string
        requires2fa?: boolean
        requires2faSetup?: boolean
        challengeId?: string
      }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Não autorizado')
        return
      }
      void remember
      if (data.requires2fa && data.challengeId) {
        setChallengeId(data.challengeId)
        return
      }
      if (data.requires2faSetup && data.challengeId) {
        try {
          sessionStorage.setItem('ih_admin_2fa_challenge', data.challengeId)
        } catch {
          /* ignore */
        }
        router.replace('/admin/security/2fa?setup=1')
        return
      }
      window.location.assign(data.redirectTo || '/paineladmin')
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const submit2fa = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          code: totpCode,
          recovery: useRecovery,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; redirectTo?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Código inválido')
        return
      }
      window.location.assign(data.redirectTo || '/paineladmin')
    } catch {
      setError('Falha de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
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
          {challengeId
            ? 'Segundo fator — código do autenticador'
            : 'Ambiente restrito — Super Admin da plataforma'}
        </p>

        <Alert
          className="mt-6"
          variant="warning"
          title="Acesso restrito"
          description="Sessão assinada HttpOnly. Tentativas são registradas em log de segurança."
        />

        {error ? (
          <Alert className="mt-4" variant="destructive" title="Não autorizado" description={error} />
        ) : null}

        {challengeId ? (
          <form onSubmit={submit2fa} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                {useRecovery ? 'Código de recuperação' : 'Código TOTP'}
              </label>
              <Input
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder={useRecovery ? 'XXXXXXXXXX' : '000000'}
                disabled={loading}
                className="border-slate-700 bg-slate-950 text-white"
                autoComplete="one-time-code"
                inputMode={useRecovery ? 'text' : 'numeric'}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="use-recovery" checked={useRecovery} onCheckedChange={setUseRecovery} />
              <label htmlFor="use-recovery" className="text-sm text-slate-300">
                Usar código de recuperação
              </label>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Validando…' : 'Confirmar 2FA'}
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-slate-400 hover:underline"
              onClick={() => {
                setChallengeId('')
                setTotpCode('')
              }}
            >
              Voltar ao login
            </button>
          </form>
        ) : (
          <form onSubmit={submitPassword} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">E-mail</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                disabled={loading}
                className="border-slate-700 bg-slate-950 text-white"
                autoComplete="username"
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
                  autoComplete="current-password"
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
        )}

        {showSeed ? (
          <p className="mt-6 text-center text-xs text-slate-500">
            Dev seed: admin@plataforma.com.br (somente ENABLE_DEV_SEED)
          </p>
        ) : (
          <p className="mt-6 text-center text-xs text-slate-500">
            Credenciais de demonstração desabilitadas neste ambiente.
          </p>
        )}
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
