'use client'

import Link from 'next/link'
import { publicRealtorProfiles, getRealtorProperties } from '@/lib/phase9-data'
import { Button } from '@/components/design-system/buttons/button'
import { Badge } from '@/components/design-system/feedback/badge'

export default function ClienteIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Área privada do cliente</h1>
      <p className="mt-2 text-muted-foreground">
        Escolha o corretor pelo link individual. Você permanecerá vinculado a ele.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {publicRealtorProfiles.map((profile) => (
          <div key={profile.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <img src={profile.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-foreground">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.creci}</p>
              </div>
            </div>
            <Badge className="mt-3" variant="info">
              {getRealtorProperties(profile.id).length} imóveis
            </Badge>
            <div className="mt-4">
              <Link href={`/cliente/${profile.slug}/login`}>
                <Button className="w-full">Entrar como cliente</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
