'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Contato</h1>
      <p className="mt-2 text-sm text-muted-foreground">Formulário simulado — sem envio real.</p>
      {sent ? (
        <Alert className="mt-6" variant="success" description="Mensagem registrada visualmente." />
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
        >
          <Input label="Nome" required />
          <Input label="E-mail" type="email" required />
          <Textarea label="Mensagem" required />
          <Button type="submit" className="w-full">
            Enviar
          </Button>
        </form>
      )}
      <Link href="/" className="mt-6 inline-block text-sm text-primary hover:underline">
        Voltar à landing
      </Link>
    </div>
  )
}
