'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Checkbox } from '@/components/design-system/forms/checkbox'
import { Alert } from '@/components/design-system/feedback/alert'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import {
  getClientSession,
  loadJson,
  saveJson,
  setFinancialConsent,
} from '@/lib/client-auth'
import { ClientFinancialProfile, defaultFinancial } from '@/lib/phase11-data'

export default function ClientFinancialPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [form, setForm] = useState<ClientFinancialProfile>(defaultFinancial())
  const [consent, setConsent] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(loadJson('financial', defaultFinancial()))
    setConsent(getClientSession()?.financialConsent || false)
  }, [])

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perfil financeiro</h1>
        <p className="text-sm text-muted-foreground">Dados sensíveis com consentimento explícito</p>
      </div>

      <Alert
        variant="info"
        title="Privacidade e consentimento"
        description={`Suas informações financeiras são confidenciais e destinadas apenas ao atendimento de ${profile.name}. Não há cálculo bancário real nesta fase.`}
      />

      {error ? <Alert variant="destructive" description={error} /> : null}
      {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}

      <PageState state={state} onRetry={reload}>
        <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5">
          <Checkbox
            checked={consent}
            onCheckedChange={setConsent}
            label="Autorizo o tratamento confidencial dos meus dados financeiros"
          />
          <Input label="Renda familiar" value={form.familyIncome} onChange={(e) => setForm({ ...form, familyIncome: e.target.value })} />
          <Input label="Faixa de renda" value={form.incomeRange} onChange={(e) => setForm({ ...form, incomeRange: e.target.value })} />
          <Input label="Entrada disponível" value={form.downPayment} onChange={(e) => setForm({ ...form, downPayment: e.target.value })} />
          <Input label="Parcela máxima" value={form.maxInstallment} onChange={(e) => setForm({ ...form, maxInstallment: e.target.value })} />
          <Input label="Banco de preferência" value={form.bank} onChange={(e) => setForm({ ...form, bank: e.target.value })} />
          <Checkbox checked={form.useFgts} onCheckedChange={(v) => setForm({ ...form, useFgts: v })} label="Usar FGTS" />
          <Checkbox checked={form.needsFinancing} onCheckedChange={(v) => setForm({ ...form, needsFinancing: v })} label="Precisa de financiamento" />
          <Checkbox checked={form.creditApproved} onCheckedChange={(v) => setForm({ ...form, creditApproved: v })} label="Crédito já aprovado" />
          <Textarea label="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button
            onClick={() => {
              if (!consent) {
                setError('É necessário consentir o uso dos dados financeiros.')
                return
              }
              setError('')
              setFinancialConsent(true)
              saveJson('financial', form)
              setSuccess('Perfil financeiro atualizado.')
            }}
          >
            Salvar perfil financeiro
          </Button>
        </div>
      </PageState>
    </div>
  )
}
