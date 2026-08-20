'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { isSuperAdmin } from '@/lib/auth'
import { publicRealtorProfiles, getRealtorProperties } from '@/lib/phase9-data'

export default function AdminClientPortalPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.replace('/admin/acesso-negado')
      return
    }
    setAllowed(true)
  }, [router])

  if (!allowed) return null

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Área do cliente (global)</h1>
        <p className="text-sm text-muted-foreground">
          Super Admin pode inspecionar a área privada de qualquer corretor sem misturar carteiras.
        </p>
      </div>

      <Alert
        variant="info"
        title="Acesso global"
        description="Ao entrar em uma área, você verá apenas os imóveis e leads daquele corretor."
      />

      {publicRealtorProfiles.length === 0 ? (
        <EmptyState title="Nenhum corretor" description="Cadastre corretores para inspecionar." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {publicRealtorProfiles.map((profile) => {
            const count = getRealtorProperties(profile.id).length
            return (
              <div key={profile.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <img src={profile.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-foreground">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.creci}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="info">{count} imóveis</Badge>
                  <Badge variant="default">{profile.slug}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/cliente/${profile.slug}`}>
                    <Button size="sm">Inspecionar portal</Button>
                  </Link>
                  <Link href={`/cliente/${profile.slug}/login`}>
                    <Button size="sm" variant="outline">Ver login</Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
