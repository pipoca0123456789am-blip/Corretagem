'use client'

import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { ShieldAlert } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <ShieldAlert className="mb-4 h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">Acesso negado</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Você não tem permissão para acessar este recurso. Se acredita que isso é um erro, entre em contato com o
        suporte da plataforma.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="outline">Painel do corretor</Button>
        </Link>
        <Link href="/admin/login">
          <Button>Login Super Admin</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Login corretor</Button>
        </Link>
      </div>
    </div>
  )
}
