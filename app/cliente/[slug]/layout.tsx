import { notFound } from 'next/navigation'
import { getPublicRealtorBySlug } from '@/lib/phase9-data'
import { ClientSlugShell } from '@/components/client-portal/slug-shell'

export default async function ClientRealtorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (!getPublicRealtorBySlug(slug)) notFound()

  return <ClientSlugShell>{children}</ClientSlugShell>
}
