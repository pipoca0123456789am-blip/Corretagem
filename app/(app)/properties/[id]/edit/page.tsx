'use client'

import { useEffect, useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { propertiesList } from '@/lib/mock-data'
import { getCurrentRealtorId } from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function EditPropertyPage() {
  const params = useParams()
  const propertyId = Number(params.id)
  const [property, setProperty] = useState<(typeof propertiesList)[0] | null | undefined>(undefined)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const found = propertiesList.find((p) => p.id === propertyId) || null
    if (!found) {
      setProperty(null)
      return
    }
    const realtorId = getCurrentRealtorId()
    if (!isSuperAdmin() && realtorId !== null && found.realtor?.id !== realtorId) {
      setProperty(null)
      return
    }
    setProperty(found)
  }, [propertyId])

  if (property === undefined) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          title="Imóvel não encontrado"
          description="Ele não existe ou não pertence à sua carteira."
          action={{ label: 'Voltar', onClick: () => { window.location.href = '/properties' } }}
        />
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'Painel', href: '/dashboard' },
          { label: 'Imóveis', href: '/properties' },
          { label: property.title, href: `/properties/${property.id}` },
          { label: 'Editar' },
        ]}
      />
      <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Editar imóvel</h1>
          <p className="text-sm text-muted-foreground">{property.title}</p>
        </div>

        {saved ? (
          <Alert variant="success" description="Alterações salvas localmente (simulado)." onClose={() => setSaved(false)} />
        ) : null}

        <Alert variant="info" description="Edição visual — sem persistência em backend." />

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <Input label="Título" defaultValue={property.title} />
          <Textarea label="Descrição" defaultValue={property.description} rows={4} />
          <Input label="Endereço" defaultValue={property.address} />
          <Input label="Preço (R$)" type="number" defaultValue={String(property.price)} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setSaved(true)}>Salvar</Button>
            <Link href={`/properties/${property.id}`}>
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
