import { propertiesList } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/phase7-data'

export type ListingPurpose = 'venda' | 'aluguel' | 'lancamento'
export type PublicPropertyStatus =
  | 'available'
  | 'sold'
  | 'rented'
  | 'pending'
  | 'reserved'
  | 'unavailable'

export interface PublicProperty {
  id: string
  slug: string
  realtorId: number
  title: string
  address: string
  neighborhood: string
  city: string
  price: number
  purpose: ListingPurpose
  featured: boolean
  status: PublicPropertyStatus
  bedrooms: number
  bathrooms: number
  area: number
  garage: number
  image: string
  description: string
}

export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const publicPropertyStatusLabels: Record<PublicPropertyStatus, string> = {
  available: 'Disponível',
  sold: 'Vendido',
  rented: 'Alugado',
  pending: 'Em análise',
  reserved: 'Reservado',
  unavailable: 'Indisponível',
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  rating: number
}

export interface PublicRealtorProfile {
  id: number
  slug: string
  name: string
  firstName: string
  creci: string
  title: string
  promise: string
  bio: string
  photo: string
  coverImage: string
  phone: string
  whatsapp: string
  email: string
  specialties: string[]
  regions: string[]
  differentials: string[]
  videoTitle: string
  videoThumb: string
  rating: number
  reviewsCount: number
  dealsClosed: number
  yearsExperience: number
  social: {
    instagram?: string
    linkedin?: string
    facebook?: string
    youtube?: string
  }
  accentLabel: string
  campaign?: {
    title: string
    subtitle: string
    highlight: string
    cta: string
  }
  testimonials: Testimonial[]
}

export const publicRealtorProfiles: PublicRealtorProfile[] = [
  {
    id: 1,
    slug: 'corretor-demonstracao',
    name: 'Corretor Demonstração',
    firstName: 'Corretor',
    creci: 'CRECI —',
    title: 'Sua conta está pronta para operar',
    promise: 'Cadastre imóveis e comece a atender clientes.',
    bio: 'Perfil inicial da plataforma. Personalize Meu Site e a página profissional quando quiser.',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop',
    phone: '',
    whatsapp: '',
    email: 'corretor@plataforma.com.br',
    specialties: [],
    regions: [],
    differentials: [],
    videoTitle: '',
    videoThumb: '',
    rating: 0,
    reviewsCount: 0,
    dealsClosed: 0,
    yearsExperience: 0,
    social: {},
    accentLabel: 'ImóvelHub',
    campaign: {
      title: '',
      subtitle: '',
      highlight: '',
      cta: '',
    },
    testimonials: [],
  },
]

const extraPublicProperties: PublicProperty[] = []

function fromMockList(): PublicProperty[] {
  return propertiesList.map((p) => ({
    id: `mock-${p.id}`,
    slug: slugifyTitle(p.title),
    realtorId: p.realtor.id,
    title: p.title,
    address: p.address,
    neighborhood: p.address.split(',')[0],
    city: 'São Paulo',
    price: p.price,
    purpose: 'venda' as ListingPurpose,
    featured: false,
    status:
      p.status === 'sold'
        ? 'sold'
        : p.status === 'rented'
          ? 'rented'
          : p.status === 'published'
            ? 'available'
            : 'pending',
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    garage: p.garage,
    image:
      p.id === 1
        ? 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        : p.id === 2
          ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
          : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    description: p.description,
  }))
}

export const allPublicProperties: PublicProperty[] = [
  ...extraPublicProperties,
  ...fromMockList().filter(
    (p) => !extraPublicProperties.some((e) => e.title === p.title && e.realtorId === p.realtorId)
  ),
]

export function getPublicRealtorBySlug(slug: string): PublicRealtorProfile | undefined {
  return publicRealtorProfiles.find((r) => r.slug === slug)
}

export function getRealtorProperties(realtorId: number): PublicProperty[] {
  let list = allPublicProperties.filter((p) => p.realtorId === realtorId)
  if (typeof window !== 'undefined') {
    try {
      const {
        isPropertyVisibleOnSite,
        getExtraSiteProperties,
      } = require('@/lib/meu-site-data') as typeof import('@/lib/meu-site-data')
      const extras = getExtraSiteProperties(realtorId).map(
        (p) =>
          ({
            id: p.id,
            slug: p.slug,
            realtorId: p.realtorId,
            title: p.title,
            address: p.address,
            neighborhood: p.neighborhood,
            city: p.city,
            price: p.price,
            purpose: p.purpose,
            featured: p.featured,
            status: p.status as PublicProperty['status'],
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            area: p.area,
            garage: p.garage,
            image: p.image,
            description: p.description,
          }) satisfies PublicProperty
      )
      const byId = new Map<string, PublicProperty>()
      ;[...list, ...extras].forEach((p) => byId.set(String(p.id), p))
      list = Array.from(byId.values()).filter((p) =>
        isPropertyVisibleOnSite({
          id: String(p.id).replace(/^mock-/, ''),
          status: p.status,
          realtorId: p.realtorId,
        })
      )
    } catch {
      /* ignore */
    }
  }
  return list
}

export function getPublicPropertyBySlugs(
  realtorSlug: string,
  propertySlug: string
): { profile: PublicRealtorProfile; property: PublicProperty } | null {
  const profile = getPublicRealtorBySlug(realtorSlug)
  if (!profile) return null
  const property = getRealtorProperties(profile.id).find((p) => p.slug === propertySlug)
  if (!property) return null
  return { profile, property }
}

export function getSimilarProperties(property: PublicProperty, limit = 3): PublicProperty[] {
  return getRealtorProperties(property.realtorId)
    .filter((p) => p.id !== property.id && p.status === 'available')
    .sort((a, b) => {
      const samePurpose = Number(b.purpose === property.purpose) - Number(a.purpose === property.purpose)
      if (samePurpose !== 0) return samePurpose
      return Math.abs(a.price - property.price) - Math.abs(b.price - property.price)
    })
    .slice(0, limit)
}

export function purposeLabel(purpose: ListingPurpose): string {
  const map = { venda: 'Venda', aluguel: 'Aluguel', lancamento: 'Lançamento' }
  return map[purpose]
}

export function formatListingPrice(property: PublicProperty): string {
  const value = formatCurrency(property.price)
  return property.purpose === 'aluguel' ? `${value}/mês` : value
}

export function toCardStatus(
  status: PublicPropertyStatus
): 'available' | 'sold' | 'rented' | 'pending' {
  if (status === 'reserved' || status === 'unavailable') return 'pending'
  return status
}

export { formatCurrency }
