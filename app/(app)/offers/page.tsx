'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Alert } from '@/components/design-system/feedback/alert'

export default function OffersPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/negotiations')
  }, [router])

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Ofertas' }]} />
      <div className="p-4 md:p-6 space-y-4">
        <Alert
          variant="info"
          title="Redirecionando"
          description="O módulo de Ofertas foi integrado a Propostas e Negociações."
        />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
