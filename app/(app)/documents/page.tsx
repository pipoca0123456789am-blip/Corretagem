'use client'

import { useEffect, useMemo, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Input } from '@/components/design-system/forms/input'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'

type DocRow = {
  id: string
  realtorId: number
  title: string
  category: string
  status: string
  updatedAt: string
}

const seedDocs: DocRow[] = [
  { id: 'd1', realtorId: 1, title: 'Contrato de compra — Cobertura Moema', category: 'Contrato', status: 'Assinado', updatedAt: '20/07/2026' },
  { id: 'd2', realtorId: 1, title: 'RG/CPF — Ana Souza', category: 'Cliente', status: 'Aprovado', updatedAt: '22/07/2026' },
  { id: 'd3', realtorId: 1, title: 'Matrícula — Casa Alphaville', category: 'Imóvel', status: 'Pendente', updatedAt: '25/07/2026' },
  { id: 'd4', realtorId: 2, title: 'Proposta — Apto Tamboré', category: 'Proposta', status: 'Enviado', updatedAt: '18/07/2026' },
  { id: 'd5', realtorId: 2, title: 'Comprovante — página profissional', category: 'Pagamento', status: 'Aprovado', updatedAt: '12/07/2026' },
  { id: 'd6', realtorId: 3, title: 'Ficha cadastral — Paulo Nogueira', category: 'Cliente', status: 'Rascunho', updatedAt: '27/07/2026' },
]

export default function DocumentsPage() {
  const [q, setQ] = useState('')
  const [admin, setAdmin] = useState(false)
  const [realtorId, setRealtorId] = useState<number | null>(1)
  const [toast, setToast] = useState('')

  useEffect(() => {
    setAdmin(isSuperAdmin())
    setRealtorId(getCurrentRealtorId())
  }, [])

  const docs = useMemo(() => {
    const base = admin || realtorId === null ? seedDocs : seedDocs.filter((d) => d.realtorId === realtorId)
    const query = q.toLowerCase()
    return base.filter((d) => !query || d.title.toLowerCase().includes(query) || d.category.toLowerCase().includes(query))
  }, [admin, realtorId, q])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Documentos' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Documentos</h1>
            <p className="text-sm text-muted-foreground">
              {admin ? 'Documentos de todas as carteiras' : 'Arquivos da sua operação'}
            </p>
          </div>
          <Button onClick={() => setToast('Upload simulado — nenhum arquivo real foi enviado.')}>
            Enviar documento
          </Button>
        </div>

        {toast ? <Alert variant="success" description={toast} onClose={() => setToast('')} /> : null}

        <Input placeholder="Buscar documento" value={q} onChange={(e) => setQ(e.target.value)} />

        {docs.length === 0 ? (
          <EmptyState title="Nenhum documento" description="Envie contratos, documentos de clientes ou comprovantes." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Documento</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t border-border">
                      <td className="px-4 py-3 text-foreground">
                        {d.title}
                        {admin ? <span className="block text-xs text-muted-foreground">corretor #{d.realtorId}</span> : null}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.category}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{d.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
