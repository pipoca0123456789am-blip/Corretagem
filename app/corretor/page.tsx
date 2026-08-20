import Link from 'next/link'
import { publicRealtorProfiles, getRealtorProperties } from '@/lib/phase9-data'
import { Badge } from '@/components/design-system/feedback/badge'
import { Button } from '@/components/design-system/buttons/button'

export default function PublicRealtorsIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">ImóvelHub</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
          Páginas públicas dos corretores
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Cada corretor possui vitrine exclusiva. Imóveis e leads nunca são misturados entre perfis.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicRealtorProfiles.map((profile) => {
            const count = getRealtorProperties(profile.id).length
            return (
              <div key={profile.slug} className="overflow-hidden rounded-xl border border-border bg-card">
                <img src={profile.photo} alt={profile.name} className="h-48 w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="font-semibold text-foreground">{profile.name}</h2>
                    <p className="text-xs text-muted-foreground">{profile.creci}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary">{profile.accentLabel}</Badge>
                    <Badge variant="default">{count} imóveis</Badge>
                  </div>
                  <Link href={`/corretor/${profile.slug}`}>
                    <Button variant="outline" className="w-full">
                      Abrir página pública
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
