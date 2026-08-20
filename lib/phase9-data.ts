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
    creci: 'CRECI-SP 00.001-F',
    title: 'Corretor demonstração da plataforma',
    promise: 'Atendimento demonstrativo com carteira isolada no ImóvelHub.',
    bio: 'Conta seed de desenvolvimento vinculada a corretor@plataforma.com.br.',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=700&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop',
    phone: '(11) 90000-0001',
    whatsapp: '5511900000001',
    email: 'corretor@plataforma.com.br',
    specialties: ['Apartamentos de luxo', 'Investimento residencial', 'Primeira compra', 'Upgrades de patrimônio'],
    regions: ['Vila Mariana', 'Moema', 'Jardins', 'Itaim Bibi', 'Centro'],
    differentials: [
      'Análise comparativa de mercado em até 24h',
      'Rede de parceiros jurídicos e financiamentos',
      'Tour presencial e virtual',
      'Acompanhamento pós-venda',
    ],
    videoTitle: 'Conheça minha forma de trabalhar',
    videoThumb: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=700&fit=crop',
    rating: 4.8,
    reviewsCount: 47,
    dealsClosed: 186,
    yearsExperience: 9,
    social: {
      instagram: '@carlos.imoveis',
      linkedin: 'Carlos Eduardo Silva',
      facebook: 'Carlos Imóveis SP',
      youtube: 'Carlos Imóveis',
    },
    accentLabel: 'ImóvelHub Profissional',
    campaign: {
      title: 'Oportunidades selecionadas em julho',
      subtitle: 'Apartamentos e salas com condição especial de visita esta semana.',
      highlight: 'Agende uma visita prioritária comigo',
      cta: 'Quero oportunidades agora',
    },
    testimonials: [
      {
        id: 't1',
        name: 'Ana Paula Mendes',
        role: 'Compradora — Vila Mariana',
        text: 'O Carlos conduziu toda a negociação com clareza. Me senti segura do primeiro contato à assinatura.',
        rating: 5,
      },
      {
        id: 't2',
        name: 'Lucas Martins Souza',
        role: 'Primeiro imóvel',
        text: 'Explicou financiamento, FGTS e prazos sem enrolação. Recomendo demais.',
        rating: 5,
      },
      {
        id: 't3',
        name: 'João Silva',
        role: 'Proprietário',
        text: 'Vendeu meu apartamento acima da expectativa e com comunicação impecável.',
        rating: 5,
      },
    ],
  },
  {
    id: 2,
    slug: 'marina-costa-santos',
    name: 'Marina Costa Santos',
    firstName: 'Marina',
    creci: 'CRECI-SP 52.104-F',
    title: 'Especialista em condomínios e casas em Alphaville',
    promise: 'Curadoria sofisticada para quem busca qualidade de vida e valorização.',
    bio: 'Especialista em imóveis de condomínio fechado e residências contemporâneas. Minha prioridade é entender o estilo de vida da família antes de apresentar opções, reduzindo visitas desnecessárias e acelerando decisões com segurança.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=700&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=900&fit=crop',
    phone: '(11) 99876-5432',
    whatsapp: '5511998765432',
    email: 'marina.costa@corretor.hub',
    specialties: ['Casas em condomínio', 'Alphaville e entorno', 'Relançamento de imóveis', 'Consultoria para investidores'],
    regions: ['Alphaville', 'Tamboré', 'Barueri', 'Santana de Parnaíba'],
    differentials: [
      'Seleção criteriosa de imóveis',
      'Assessoria completa à família',
      'Rede de arquitetos e reformas',
      'Disponibilidade aos finais de semana',
    ],
    videoTitle: 'Por que escolher a Marina',
    videoThumb: 'https://images.unsplash.com/photo-1600607687939-ce8a6c7788f8?w=1200&h=700&fit=crop',
    rating: 4.9,
    reviewsCount: 62,
    dealsClosed: 214,
    yearsExperience: 11,
    social: {
      instagram: '@marina.costaimoveis',
      linkedin: 'Marina Costa Santos',
      facebook: 'Marina Costa Imóveis',
    },
    accentLabel: 'ImóvelHub Profissional',
    campaign: {
      title: 'Casas com visita exclusiva no fim de semana',
      subtitle: 'Seleção Alphaville com condições especiais de apresentação.',
      highlight: 'Vagas limitadas para tours particulares',
      cta: 'Reservar meu horário',
    },
    testimonials: [
      {
        id: 't1',
        name: 'Fernanda Oliveira Rocha',
        role: 'Compradora',
        text: 'A Marina entendeu exatamente o que buscávamos. Processo leve e profissional.',
        rating: 5,
      },
      {
        id: 't2',
        name: 'Maria Santos',
        role: 'Proprietária',
        text: 'Excelente posicionamento de preço e divulgação. Resultado rápido.',
        rating: 5,
      },
    ],
  },
  {
    id: 3,
    slug: 'roberto-ferreira-junior',
    name: 'Roberto Ferreira Junior',
    firstName: 'Roberto',
    creci: 'CRECI-RJ 28.441-F',
    title: 'Corretor focado em Zona Sul e oportunidades acessíveis',
    promise: 'Atendimento direto, opções reais e foco no seu momento de vida.',
    bio: 'Atendo compradores de primeira viagem e investidores em busca de boa liquidez no Rio de Janeiro, com linguagem simples e acompanhamento próximo em cada etapa.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=700&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&h=900&fit=crop',
    phone: '(21) 98765-1234',
    whatsapp: '5521987651234',
    email: 'roberto.ferreira@corretor.hub',
    specialties: ['Primeiro imóvel', 'Compactos', 'Locação residencial'],
    regions: ['Copacabana', 'Botafogo', 'Tijuca', 'Centro'],
    differentials: ['Plantão rápido no WhatsApp', 'Simulação de financiamento', 'Visitas organizadas'],
    videoTitle: 'Como eu ajudo na sua compra',
    videoThumb: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=700&fit=crop',
    rating: 4.6,
    reviewsCount: 29,
    dealsClosed: 98,
    yearsExperience: 6,
    social: { instagram: '@roberto.rj.imoveis' },
    accentLabel: 'ImóvelHub Inicial',
    testimonials: [
      {
        id: 't1',
        name: 'Cliente Zona Leste',
        role: 'Comprador',
        text: 'Roberto foi objetivo e encontrou opções dentro do meu orçamento.',
        rating: 5,
      },
    ],
  },
  {
    id: 4,
    slug: 'juliana-lima-oliveira',
    name: 'Juliana Lima Oliveira',
    firstName: 'Juliana',
    creci: 'CRECI-MG 19.773-F',
    title: 'Especialista em salas comerciais e investimentos',
    promise: 'Imóveis comerciais com leitura estratégica de retorno.',
    bio: 'Ajudo empresários e investidores a encontrar salas e pontos comerciais com boa vacância controlada e potencial de valorização, especialmente em eixos corporativos.',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=700&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop',
    phone: '(31) 98765-9876',
    whatsapp: '5531987659876',
    email: 'juliana.lima@corretor.hub',
    specialties: ['Salas comerciais', 'Investimento', 'Paulista e adjacências'],
    regions: ['Avenida Paulista', 'Bela Vista', 'Consolação'],
    differentials: ['Estudo de ROI', 'Rede de locatários qualificados', 'Suporte documental'],
    videoTitle: 'Investindo com segurança',
    videoThumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=700&fit=crop',
    rating: 4.7,
    reviewsCount: 34,
    dealsClosed: 121,
    yearsExperience: 8,
    social: { linkedin: 'Juliana Lima Oliveira', instagram: '@juliana.comercial' },
    accentLabel: 'ImóvelHub Profissional',
    testimonials: [
      {
        id: 't1',
        name: 'Patrícia Almeida Nunes',
        role: 'Investidora',
        text: 'Compra à vista conduzida com excelência. Documentação impecável.',
        rating: 5,
      },
    ],
  },
  {
    id: 5,
    slug: 'diego-alves-pereira',
    name: 'Diego Alves Pereira',
    firstName: 'Diego',
    creci: 'CRECI-CE 12.550-F',
    title: 'Corretor em início de expansão digital',
    promise: 'Atendimento humano e oportunidades selecionadas no Ceará.',
    bio: 'Estou estruturando minha vitrine digital no ImóvelHub. Em breve novos imóveis serão publicados com curadoria local.',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=700&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9b274b3f0df0?w=1600&h=900&fit=crop',
    phone: '(85) 98765-5678',
    whatsapp: '5585987655678',
    email: 'diego.alves@corretor.hub',
    specialties: ['Residencial', 'Locação'],
    regions: ['Fortaleza', 'Meireles', 'Aldeota'],
    differentials: ['Atendimento regional', 'Flexibilidade de horários'],
    videoTitle: 'Em breve: apresentação',
    videoThumb: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=700&fit=crop',
    rating: 4.3,
    reviewsCount: 8,
    dealsClosed: 22,
    yearsExperience: 3,
    social: { instagram: '@diego.ce.imoveis' },
    accentLabel: 'ImóvelHub Inicial',
    testimonials: [],
  },
]

const extraPublicProperties: PublicProperty[] = [
  {
    id: 'pp-1',
    slug: 'apartamento-luxo-vila-mariana',
    realtorId: 1,
    title: 'Apartamento Luxo Vila Mariana',
    address: 'Vila Mariana, São Paulo - SP',
    neighborhood: 'Vila Mariana',
    city: 'São Paulo',
    price: 1250000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    garage: 2,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    description: 'Acabamento premium, varanda gourmet e lazer completo.',
  },
  {
    id: 'pp-2',
    slug: 'cobertura-moema-vista-panoramica',
    realtorId: 1,
    title: 'Cobertura Moema com vista panorâmica',
    address: 'Moema, São Paulo - SP',
    neighborhood: 'Moema',
    city: 'São Paulo',
    price: 980000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 3,
    bathrooms: 3,
    area: 165,
    garage: 2,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
    description: 'Cobertura reformada, pronta para morar.',
  },
  {
    id: 'pp-3',
    slug: 'studio-mobiliado-jardins',
    realtorId: 1,
    title: 'Studio mobiliado Jardins',
    address: 'Jardins, São Paulo - SP',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    price: 4500,
    purpose: 'aluguel',
    featured: true,
    status: 'available',
    bedrooms: 1,
    bathrooms: 1,
    area: 42,
    garage: 1,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    description: 'Ideal para executivos. Incluso condomínio parcial.',
  },
  {
    id: 'pp-4',
    slug: 'lancamento-residencial-aurora',
    realtorId: 1,
    title: 'Lançamento — Residencial Aurora',
    address: 'Itaim Bibi, São Paulo - SP',
    neighborhood: 'Itaim Bibi',
    city: 'São Paulo',
    price: 890000,
    purpose: 'lancamento',
    featured: true,
    status: 'pending',
    bedrooms: 2,
    bathrooms: 2,
    area: 78,
    garage: 1,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    description: 'Unidades na planta com condições de entrada facilitada.',
  },
  {
    id: 'pp-5',
    slug: 'comercial-centro-sao-paulo',
    realtorId: 1,
    title: 'Comercial Centro São Paulo',
    address: 'Centro, São Paulo - SP',
    neighborhood: 'Centro',
    city: 'São Paulo',
    price: 2500000,
    purpose: 'venda',
    featured: false,
    status: 'reserved',
    bedrooms: 0,
    bathrooms: 3,
    area: 450,
    garage: 8,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    description: 'Espaço corporativo em eixo estratégico.',
  },
  {
    id: 'pp-6',
    slug: 'apartamento-compacto-locacao-vila-mariana',
    realtorId: 1,
    title: 'Apartamento compacto para locação',
    address: 'Vila Mariana, São Paulo - SP',
    neighborhood: 'Vila Mariana',
    city: 'São Paulo',
    price: 3200,
    purpose: 'aluguel',
    featured: false,
    status: 'rented',
    bedrooms: 2,
    bathrooms: 1,
    area: 58,
    garage: 1,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    description: 'Próximo ao metrô, mobiliado parcialmente.',
  },
  {
    id: 'pp-7',
    slug: 'casa-moderna-condominio-alphaville',
    realtorId: 2,
    title: 'Casa Moderna em Condomínio',
    address: 'Alphaville, São Paulo - SP',
    neighborhood: 'Alphaville',
    city: 'Barueri',
    price: 850000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    garage: 3,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    description: 'Casa contemporânea com área de lazer completa.',
  },
  {
    id: 'pp-8',
    slug: 'casa-jardim-europa',
    realtorId: 2,
    title: 'Casa Jardim Europa',
    address: 'Jardim Europa, São Paulo - SP',
    neighborhood: 'Jardim Europa',
    city: 'São Paulo',
    price: 4200000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 5,
    bathrooms: 6,
    area: 480,
    garage: 4,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    description: 'Residência de alto padrão com jardim paisagístico e living integrado.',
  },
  {
    id: 'pp-9',
    slug: 'casa-locacao-alphaville',
    realtorId: 2,
    title: 'Casa para locação — Alphaville',
    address: 'Alphaville, São Paulo - SP',
    neighborhood: 'Alphaville',
    city: 'Barueri',
    price: 9800,
    purpose: 'aluguel',
    featured: true,
    status: 'available',
    bedrooms: 3,
    bathrooms: 3,
    area: 190,
    garage: 2,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    description: 'Mobiliada, pronta para entrada imediata.',
  },
  {
    id: 'pp-10',
    slug: 'lancamento-vertentes-residence',
    realtorId: 2,
    title: 'Lançamento Vertentes Residence',
    address: 'Alphaville, São Paulo - SP',
    neighborhood: 'Alphaville',
    city: 'Barueri',
    price: 760000,
    purpose: 'lancamento',
    featured: false,
    status: 'pending',
    bedrooms: 3,
    bathrooms: 2,
    area: 95,
    garage: 2,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    description: 'Torre com lazer completo e entrega prevista para 2027.',
  },
  {
    id: 'pp-11',
    slug: 'sala-comercial-av-paulista',
    realtorId: 4,
    title: 'Sala Comercial Av. Paulista',
    address: 'Avenida Paulista, São Paulo - SP',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    price: 450000,
    purpose: 'venda',
    featured: true,
    status: 'sold',
    bedrooms: 0,
    bathrooms: 1,
    area: 85,
    garage: 0,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
    description: 'Sala em prédio moderno com ótima visibilidade.',
  },
  {
    id: 'pp-12',
    slug: 'conjunto-comercial-locacao-consolacao',
    realtorId: 4,
    title: 'Conjunto comercial para locação',
    address: 'Consolação, São Paulo - SP',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    price: 7500,
    purpose: 'aluguel',
    featured: false,
    status: 'unavailable',
    bedrooms: 0,
    bathrooms: 2,
    area: 110,
    garage: 2,
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop',
    description: 'Pronto para escritório boutique.',
  },
  {
    id: 'pp-13',
    slug: 'apartamento-compacto-zona-leste',
    realtorId: 3,
    title: 'Apartamento Compacto Zona Leste',
    address: 'Vila Prudente, São Paulo - SP',
    neighborhood: 'Vila Prudente',
    city: 'São Paulo',
    price: 350000,
    purpose: 'venda',
    featured: true,
    status: 'available',
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    garage: 1,
    image: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
    description: 'Ótimo custo-benefício, próximo ao metrô.',
  },
]

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
