import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Termos de uso</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Este ambiente é uma demonstração do ImóvelHub. Não há contratação real, cobrança recorrente
        real nem processamento real de pagamentos. Ao explorar a plataforma, você compreende que os
        dados são fictícios e os fluxos são simulados para validação de produto e design.
      </p>
      <Link href="/" className="mt-8 inline-block">
        <Button variant="outline">Voltar</Button>
      </Link>
    </div>
  )
}
