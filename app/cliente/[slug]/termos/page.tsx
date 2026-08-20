'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { ClientAuthShell, useClientRealtor } from '@/components/client-portal/chrome'
import {
  acceptClientTerms,
  canAccessClientPortal,
  getClientSession,
} from '@/lib/client-auth'

export default function ClientTermsPage() {
  const router = useRouter()
  const { slug, profile } = useClientRealtor()
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!canAccessClientPortal(slug)) {
      router.replace(`/cliente/${slug}/login`)
    }
  }, [slug, router])

  if (!profile) return null
  const base = `/cliente/${slug}`

  const confirm = () => {
    if (!terms || !privacy) {
      setError('Aceite os termos e a política de privacidade para continuar.')
      return
    }
    acceptClientTerms()
    setSuccess(true)
    const session = getClientSession()
    setTimeout(() => {
      router.push(session?.onboardingComplete ? base : `${base}/onboarding`)
    }, 700)
  }

  return (
    <ClientAuthShell
      title="Aceite de termos"
      subtitle="Seu atendimento permanece exclusivo deste corretor"
    >
      {error ? <Alert className="mb-4" variant="destructive" description={error} /> : null}
      {success ? (
        <Alert className="mb-4" variant="success" description="Termos aceitos com sucesso." />
      ) : null}

      <div className="mb-4 max-h-56 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          Ao continuar, você concorda em ser atendido exclusivamente por {profile.name} ({profile.creci})
          através desta área privada.
        </p>
        <p>
          Seus dados de contato, preferências e documentos ficam vinculados a este corretor e não são
          compartilhados com outras carteiras da plataforma nesta fase.
        </p>
        <p>
          Informações financeiras serão tratadas com confidencialidade e exigirão consentimento
          específico na etapa de perfil financeiro.
        </p>
      </div>

      <div className="space-y-3">
        <Checkbox
          checked={terms}
          onCheckedChange={setTerms}
          label="Li e aceito os termos de uso da área do cliente"
        />
        <Checkbox
          checked={privacy}
          onCheckedChange={setPrivacy}
          label="Concordo com a política de privacidade e o vínculo com este corretor"
        />
      </div>

      <Button className="mt-6 w-full" onClick={confirm}>
        Aceitar e continuar
      </Button>
    </ClientAuthShell>
  )
}
