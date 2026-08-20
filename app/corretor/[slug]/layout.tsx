import { PublicRealtorShell } from '@/components/public-realtor/public-shell'

export default async function PublicRealtorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return <PublicRealtorShell slug={slug}>{children}</PublicRealtorShell>
}
