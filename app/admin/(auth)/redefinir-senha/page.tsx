'use client'

import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'

export default function AdminResetPasswordPage() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-8">
      <h1 className="text-2xl font-bold text-white">Redefinir senha administrativa</h1>
      <p className="mt-2 text-sm text-slate-400">Fluxo simulado de desenvolvimento.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          alert('Senha administrativa atualizada (simulado).')
          window.location.href = '/admin/login'
        }}
      >
        <Input type="password" label="Nova senha" required />
        <Input type="password" label="Confirmar senha" required />
        <Button type="submit" className="w-full">
          Salvar nova senha
        </Button>
      </form>
      <Link href="/admin/login" className="mt-4 block text-center text-sm text-amber-400 hover:underline">
        Voltar ao login admin
      </Link>
    </div>
  )
}
