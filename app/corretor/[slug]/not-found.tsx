import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { publicRealtorProfiles } from '@/lib/phase9-data'

export default function PublicRealtorNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-foreground">Corretor não encontrado</h1>
      <p className="mt-3 text-muted-foreground">
        Verifique o endereço ou escolha um dos perfis públicos disponíveis.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {publicRealtorProfiles.slice(0, 3).map((profile) => (
          <Link key={profile.slug} href={`/corretor/${profile.slug}`}>
            <Button variant="outline" className="w-full">
              {profile.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}
