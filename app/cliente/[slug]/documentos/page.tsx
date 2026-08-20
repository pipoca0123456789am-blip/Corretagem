'use client'

import { useState } from 'react'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Modal } from '@/components/design-system/feedback/modal'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'
import { PageState, useClientRealtor, useSimulatedLoad } from '@/components/client-portal/chrome'
import { documentStatusLabel, getClientDocuments } from '@/lib/phase11-data'

export default function ClientDocumentsPage() {
  const { profile } = useClientRealtor()
  const { state, reload } = useSimulatedLoad()
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState('')
  if (!profile) return null
  const docs = getClientDocuments()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentos</h1>
          <p className="text-sm text-muted-foreground">
            Visíveis apenas para {profile.name} — envio simulado
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Enviar documento</Button>
      </div>
      {success ? <Alert variant="success" description={success} onClose={() => setSuccess('')} /> : null}
      <PageState state={state} onRetry={reload}>
        <div className="space-y-3">
          {docs.map((doc) => (
            <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-semibold text-foreground">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.category} · atualizado em {doc.updatedAt}
                </p>
              </div>
              <Badge variant={doc.status === 'aprovado' ? 'success' : 'info'}>
                {documentStatusLabel[doc.status]}
              </Badge>
            </div>
          ))}
        </div>
      </PageState>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Enviar documento"
        description="Sem upload real nesta fase"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                setOpen(false)
                setSuccess('Documento anexado visualmente e vinculado ao corretor.')
              }}
            >
              Enviar
            </Button>
          </>
        }
      >
        <Input type="file" label="Arquivo" />
      </Modal>
    </div>
  )
}
