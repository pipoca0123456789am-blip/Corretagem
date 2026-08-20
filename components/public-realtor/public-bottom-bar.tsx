'use client'

import Link from 'next/link'
import { MessageCircle, Search, Building2, UserPlus } from 'lucide-react'
import { PublicRealtorProfile } from '@/lib/phase9-data'

export function PublicRealtorBottomBar({ profile }: { profile: PublicRealtorProfile }) {
  const base = `/corretor/${profile.slug}`
  const wa = `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-2">
        <Link
          href={`${base}/encontrar`}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[10px] font-medium text-foreground hover:bg-muted sm:text-[11px]"
        >
          <Search className="h-5 w-5 text-primary" />
          Encontrar
        </Link>
        <Link
          href={`${base}/imoveis`}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[10px] font-medium text-foreground hover:bg-muted sm:text-[11px]"
        >
          <Building2 className="h-5 w-5 text-primary" />
          Imóveis
        </Link>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[10px] font-medium text-foreground hover:bg-muted sm:text-[11px]"
        >
          <MessageCircle className="h-5 w-5 text-primary" />
          WhatsApp
        </a>
        <Link
          href={`${base}/cadastro`}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-center text-[10px] font-medium text-foreground hover:bg-muted sm:text-[11px]"
        >
          <UserPlus className="h-5 w-5 text-primary" />
          Criar conta
        </Link>
      </div>
    </div>
  )
}
