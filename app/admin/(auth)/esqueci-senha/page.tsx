'use client'

import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Alert } from '@/components/design-system/feedback/alert'

export default function AdminForgotPasswordPage() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
      <h1 className="text-2xl font-bold text-white">Recuperar acesso admin</h1>
      <p className="mt-2 text-sm text-slate-400">Envio simulado — apenas desenvolvimento.</p>
      <Alert
        className="mt-4"
        variant="info"
        description="Em produção, o fluxo usará e-mail institucional e MFA."
      />
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          alert('Link de redefinição simulado enviado (dev).')
        }}
      >
        <Input type="email" placeholder="admin@plataforma.com.br" label="E-mail administrativo" required />
        <Button type="submit" className="w-full">
          Enviar link
        </Button>
      </form>
      <Link href="/admin/login" className="mt-4 block text-center text-sm text-amber-400 hover:underline">
        Voltar ao login admin
      </Link>
    </div>
  )
}
