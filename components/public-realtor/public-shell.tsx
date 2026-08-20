'use client'

import { useEffect, useState } from 'react'
import { PublicSiteFooter, PublicSiteHeader } from '@/components/public-realtor/site-chrome'
import { PublicRealtorBottomBar } from '@/components/public-realtor/public-bottom-bar'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { PublicRealtorProfile, getPublicRealtorBySlug } from '@/lib/phase9-data'
import { bumpSiteView, getMergedPublicProfile } from '@/lib/meu-site-data'
import { getActiveBrokerTemplate } from '@/lib/template-marketplace-data'
import { usePathname } from 'next/navigation'

export function PublicRealtorShell({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [profile, setProfile] = useState<PublicRealtorProfile | null | undefined>(undefined)
  const [useTemplateChrome, setUseTemplateChrome] = useState(false)

  useEffect(() => {
    const merged = getMergedPublicProfile(slug) || getPublicRealtorBySlug(slug) || null
    setProfile(merged)
    if (merged) {
      bumpSiteView(merged.id)
      const active = getActiveBrokerTemplate(merged.id)
      const homePath = `/corretor/${slug}`
      const isHome = pathname === homePath || pathname === `/${slug}`
      setUseTemplateChrome(Boolean(active && isHome))
    } else {
      setUseTemplateChrome(false)
    }
  }, [slug, pathname])

  const isPropertyPage = pathname?.includes('/imovel/')
  const showPublicBar = !isPropertyPage && !useTemplateChrome

  if (profile === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando site do corretor…
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center px-4">
        <EmptyState
          title="Site não encontrado"
          description="Este link não corresponde a um corretor ativo na plataforma."
        />
      </div>
    )
  }

  if (useTemplateChrome) {
    return <div className="min-h-screen overflow-x-hidden">{children}</div>
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <PublicSiteHeader profile={profile} />
      <main className={showPublicBar ? 'pb-24 lg:pb-0' : 'pb-28 lg:pb-10'}>{children}</main>
      <PublicSiteFooter profile={profile} />
      {showPublicBar ? <PublicRealtorBottomBar profile={profile} /> : null}
    </div>
  )
}
