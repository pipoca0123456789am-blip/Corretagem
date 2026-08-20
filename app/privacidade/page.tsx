import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Privacidade</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Na demonstração, informações ficam no navegador (localStorage) apenas para simular sessão e
        preferências. Não há backend real. No produto final, cada corretor mantém isolamento de
        imóveis, clientes e conversas.
      </p>
      <Link href="/" className="mt-8 inline-block">
        <Button variant="outline">Voltar</Button>
      </Link>
    </div>
  )
}
