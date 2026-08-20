'use client'

import Link from 'next/link'
import { Button } from '@/components/design-system/buttons/button'
import { ShieldAlert } from 'lucide-react'

export default function AdminAccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
      <ShieldAlert className="mb-4 h-12 w-12 text-amber-400" />
      <h1 className="text-2xl font-bold">Acesso administrativo negado</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Esta conta não possui permissão para o ambiente Super Admin, ou a sessão expirou.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/admin/login">
          <Button>Ir para /admin/login</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Login do corretor</Button>
        </Link>
      </div>
    </div>
  )
}
