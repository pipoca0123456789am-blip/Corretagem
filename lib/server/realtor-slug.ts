/**
 * Resolução de slug → realtorId no servidor (auth portal cliente).
 * Não importar mocks de UI (`phase9-data` / `mock-data`) — evita dívida TS legado no gate de segurança.
 * Futuro: consultar Postgres; até lá seed mínimo alinhado ao perfil demo.
 */

export type RealtorSlugRecord = {
  id: number
  slug: string
  name: string
}

const DEMO_REALTORS: RealtorSlugRecord[] = [
  {
    id: 1,
    slug: 'corretor-demonstracao',
    name: 'Corretor Demonstração',
  },
]

export function resolveRealtorBySlug(slug: string): RealtorSlugRecord | undefined {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return undefined
  return DEMO_REALTORS.find((r) => r.slug === normalized)
}
