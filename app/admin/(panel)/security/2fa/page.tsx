'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'

export default function Admin2faPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<{
    totpEnabled?: boolean
    requireAdmin2fa?: boolean
    recoveryCodesRemaining?: number
  } | null>(null)
  const [challengeId, setChallengeId] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const fromStorage = sessionStorage.getItem('ih_admin_2fa_challenge') || ''
      const fromQuery = params.get('challenge') || ''
      setChallengeId(fromStorage || fromQuery)
    } catch {
      setChallengeId(params.get('challenge') || '')
    }
  }, [params])

  const refresh = useCallback(async () => {
    const res = await fetch('/api/auth/admin/2fa/status', { credentials: 'same-origin' })
    if (res.status === 401 || res.status === 403) {
      // Enrollment via challenge — sem sessão ainda
      setStatus({ totpEnabled: false, requireAdmin2fa: true })
      return
    }
    const data = await res.json()
    if (res.ok && data.ok) setStatus(data)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const startSetup = async () => {
    setError('')
    setLoading(true)
    setRecoveryCodes([])
    try {
      const res = await fetch('/api/auth/admin/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(challengeId ? { challengeId } : {}),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Falha ao iniciar 2FA')
        return
      }
      setQrDataUrl(data.qrDataUrl || '')
      setSecret(data.secret || '')
    } catch {
      setError('Falha de rede')
    } finally {
      setLoading(false)
    }
  }

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin/2fa/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          code,
          ...(challengeId ? { challengeId } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || 'Código inválido')
        return
      }
      setRecoveryCodes(data.recoveryCodes || [])
      setQrDataUrl('')
      setSecret('')
      setCode('')
      try {
        sessionStorage.removeItem('ih_admin_2fa_challenge')
      } catch {
        /* ignore */
      }
      await refresh()
      if (data.redirectTo) {
        setTimeout(() => {
          router.replace(data.redirectTo)
          router.refresh()
        }, 2500)
      }
    } catch {
      setError('Falha de rede')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/paineladmin' },
          { label: 'Configurações', href: '/admin/settings' },
          { label: '2FA' },
        ]}
      />
      <div className="mx-auto max-w-lg space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Autenticação em dois fatores</h1>
          <p className="text-sm text-muted-foreground">
            TOTP para Super Admin — segredo cifrado com ENCRYPTION_KEY. Sem sessão completa antes da
            confirmação quando REQUIRE_ADMIN_2FA está ativo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {status?.totpEnabled ? (
            <Badge variant="success">2FA ativo</Badge>
          ) : (
            <Badge variant="warning">2FA inativo</Badge>
          )}
          {status?.requireAdmin2fa ? <Badge variant="destructive">REQUIRE_ADMIN_2FA</Badge> : null}
          {challengeId ? <Badge variant="secondary">Enrollment via challenge</Badge> : null}
          {typeof status?.recoveryCodesRemaining === 'number' ? (
            <Badge variant="secondary">
              Recovery restantes: {status.recoveryCodesRemaining}
            </Badge>
          ) : null}
        </div>

        {error ? <Alert variant="destructive" title="Erro" description={error} /> : null}

        {recoveryCodes.length > 0 ? (
          <Alert
            variant="warning"
            title="Guarde estes códigos agora"
            description={recoveryCodes.join(' · ')}
          />
        ) : null}

        {!status?.totpEnabled ? (
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            {!qrDataUrl ? (
              <Button onClick={startSetup} disabled={loading || (!challengeId && params.get('setup') === '1' && !challengeId)}>
                {loading ? 'Gerando…' : 'Gerar QR / secret'}
              </Button>
            ) : (
              <>
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="QR TOTP" className="mx-auto rounded-lg bg-white p-2" />
                ) : null}
                <p className="break-all font-mono text-xs text-muted-foreground">Secret: {secret}</p>
                <form onSubmit={confirm} className="space-y-3">
                  <Input
                    label="Código do autenticador"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  <Button type="submit" disabled={loading || code.length < 6}>
                    Confirmar e ativar
                  </Button>
                </form>
              </>
            )}
            {params.get('setup') === '1' && !challengeId ? (
              <Alert
                variant="destructive"
                title="Desafio ausente"
                description="Faça login novamente para obter um challenge de enrollment."
              />
            ) : null}
          </div>
        ) : (
          <Alert
            variant="success"
            title="2FA configurado"
            description="No próximo login administrativo será exigido o código TOTP (ou recovery)."
          />
        )}
      </div>
    </div>
  )
}
