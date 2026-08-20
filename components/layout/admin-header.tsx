'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { getAdminSession, logoutAdmin } from '@/lib/auth'

export function AdminHeader() {
  const [name, setName] = useState('Admin')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const s = getAdminSession()
    if (s) {
      setName(s.name)
      setEmail(s.email)
    }
  }, [])

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3 pl-12 md:pl-0">
          <Shield className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-amber-300">Painel Super Admin</p>
            <p className="text-[11px] text-slate-400">Gestão global da plataforma ImóvelHub</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{name}</p>
            <p className="text-xs text-slate-400">{email}</p>
          </div>
          <Link
            href="/admin/configuracoes"
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Configurações
          </Link>
          <button
            type="button"
            className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30"
            onClick={() => {
              logoutAdmin()
              window.location.href = '/admin/login'
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
