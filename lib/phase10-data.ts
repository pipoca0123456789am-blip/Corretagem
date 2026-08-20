import {
  PublicProperty,
  PublicRealtorProfile,
  formatCurrency,
  getPublicPropertyBySlugs,
  getSimilarProperties,
  purposeLabel,
  publicPropertyStatusLabels,
} from '@/lib/phase9-data'

export type MediaKind = 'capa' | 'foto' | 'drone' | 'planta' | 'video' | 'tour360'

export interface PropertyMedia {
  id: string
  url: string
  kind: MediaKind
  label: string
}

export interface NearbyPlaces {
  schools: string[]
  markets: string[]
  pharmacies: string[]
  restaurants: string[]
  transit: string[]
}

export interface PropertyPageDetail {
  property: PublicProperty
  profile: PublicRealtorProfile
  code: string
  typeLabel: string
  suites: number
  condoFee: number
  iptu: number
  estimatedDownPayment: number
  estimatedInstallment: number
  features: string[]
  differentials: string[]
  fullDescription: string
  neighborhoodInfo: string
  nearby: NearbyPlaces
  media: PropertyMedia[]
  similar: PublicProperty[]
  convertible: boolean
}

const detailOverrides: Record<
  string,
  Partial<
    Omit<PropertyPageDetail, 'property' | 'profile' | 'similar' | 'convertible'>
  >
> = {
  'casa-jardim-europa': {
    code: 'IMV-JE-2048',
    typeLabel: 'Casa',
    suites: 4,
    condoFee: 0,
    iptu: 18500,
    estimatedDownPayment: 840000,
    estimatedInstallment: 28500,
    features: [
      'Living com pé-direito duplo',
      'Cozinha gourmet integrada',
      'Home office',
      'Piscina aquecida',
      'Espaço gourmet',
      'Jardim paisagístico',
      'Closet master',
      'Lavabo social',
    ],
    differentials: [
      'Projeto de arquiteto premiado',
      'Acabamentos importados',
      'Automação residencial',
      'Segurança perimetral',
    ],
    fullDescription:
      'Casa de alto padrão no Jardim Europa, com planta generosa, iluminação natural abundante e áreas sociais integradas ao jardim. Ideal para famílias que buscam sofisticação, privacidade e localização privilegiada na Zona Oeste de São Paulo.',
    neighborhoodInfo:
      'O Jardim Europa é um dos bairros mais valorizados de São Paulo, com ruas arborizadas, proximidade a shoppings, escolas bilíngues e fácil acesso às principais vias da cidade.',
    nearby: {
      schools: ['Escola Concept', 'Saint Paul School', 'Colégio Dante Alighieri'],
      markets: ['St. Marche', 'Casa Santa Luzia', 'Empório Santa Maria'],
      pharmacies: ['Drogaria São Paulo', 'Drogasil'],
      restaurants: ['A Casa do Porco Parente', 'Maní', 'Kinoshita'],
      transit: ['Av. Faria Lima', 'Av. Brigadeiro Faria Lima — 8 min', 'Ciclovia próxima'],
    },
  },
  'apartamento-luxo-vila-mariana': {
    code: 'IMV-VM-1180',
    typeLabel: 'Apartamento',
    suites: 2,
    condoFee: 1850,
    iptu: 7200,
    estimatedDownPayment: 250000,
    estimatedInstallment: 9200,
    features: ['Varanda gourmet', 'Piscina', 'Academia', 'Salão de festas', 'Coworking'],
    differentials: ['Andar alto', '2 vagas demarcadas', 'Armários planejados'],
    fullDescription:
      'Apartamento sofisticado em Vila Mariana, com planta bem resolvida, acabamento premium e lazer completo. Excelente para moradia definitiva ou upgrade de patrimônio.',
    neighborhoodInfo:
      'Vila Mariana combina vida urbana com infraestrutura completa: metrô, hospitais, universidades e comércio de rua.',
    nearby: {
      schools: ['Colégio Santa Cruz', 'UNIFESP'],
      markets: ['Pão de Açúcar', 'Hortifruti'],
      pharmacies: ['Drogasil', 'Raia'],
      restaurants: ['Mocotó', 'Aizomê'],
      transit: ['Metrô Santa Cruz', 'Metrô Vila Mariana'],
    },
  },
}

function defaultType(property: PublicProperty): string {
  if (property.purpose === 'lancamento') return 'Lançamento'
  if (property.bedrooms === 0) return 'Comercial'
  if (property.area >= 200) return 'Casa'
  if (property.area <= 50) return 'Studio'
  return 'Apartamento'
}

function buildMedia(property: PublicProperty): PropertyMedia[] {
  const base = property.image
  return [
    { id: 'm1', url: base, kind: 'capa', label: 'Capa' },
    {
      id: 'm2',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c7788f8?w=1200&h=800&fit=crop',
      kind: 'foto',
      label: 'Sala',
    },
    {
      id: 'm3',
      url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=800&fit=crop',
      kind: 'foto',
      label: 'Cozinha',
    },
    {
      id: 'm4',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=800&fit=crop',
      kind: 'foto',
      label: 'Suíte',
    },
    {
      id: 'm5',
      url: 'https://images.unsplash.com/photo-1600047509358-9dc75590da30?w=1200&h=800&fit=crop',
      kind: 'drone',
      label: 'Vista aérea',
    },
    {
      id: 'm6',
      url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=800&fit=crop',
      kind: 'planta',
      label: 'Planta',
    },
    {
      id: 'm7',
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop',
      kind: 'video',
      label: 'Vídeo',
    },
    {
      id: 'm8',
      url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop',
      kind: 'tour360',
      label: 'Tour 360°',
    },
  ]
}

export function getPropertyPageDetail(
  realtorSlug: string,
  propertySlug: string
): PropertyPageDetail | null {
  const match = getPublicPropertyBySlugs(realtorSlug, propertySlug)
  if (!match) return null

  const { profile, property } = match
  const override = detailOverrides[property.slug] || {}
  const isSale = property.purpose !== 'aluguel'
  const estimatedDownPayment =
    override.estimatedDownPayment ??
    (isSale ? Math.round(property.price * 0.2) : 0)
  const estimatedInstallment =
    override.estimatedInstallment ??
    (isSale ? Math.round((property.price * 0.8) / 360) : property.price)

  return {
    property,
    profile,
    code: override.code || `IMV-${property.id.toUpperCase()}`,
    typeLabel: override.typeLabel || defaultType(property),
    suites: override.suites ?? Math.max(0, property.bedrooms - 1),
    condoFee: override.condoFee ?? (property.bedrooms === 0 ? 1200 : 980),
    iptu: override.iptu ?? Math.round(property.price * 0.006),
    estimatedDownPayment,
    estimatedInstallment,
    features:
      override.features ||
      ['Ótima iluminação', 'Armários planejados', 'Piso porcelanato', 'Área de serviço'],
    differentials:
      override.differentials ||
      ['Localização estratégica', 'Documentação regular', 'Pronto para visita'],
    fullDescription:
      override.fullDescription ||
      `${property.description} Imóvel apresentado exclusivamente por ${profile.name}, com atendimento consultivo e acompanhamento completo da negociação.`,
    neighborhoodInfo:
      override.neighborhoodInfo ||
      `${property.neighborhood} oferece boa infraestrutura urbana, comércio de conveniência e acesso facilitado às principais vias da região.`,
    nearby: override.nearby || {
      schools: ['Escola Municipal local', 'Colégio particular próximo'],
      markets: ['Supermercado do bairro', 'Hortifruti'],
      pharmacies: ['Farmácia 24h', 'Drogaria São Paulo'],
      restaurants: ['Padaria artesanal', 'Restaurante local'],
      transit: ['Ponto de ônibus', 'Ciclovia'],
    },
    media: override.media || buildMedia(property),
    similar: getSimilarProperties(property, 3),
    convertible: ['available', 'pending', 'reserved'].includes(property.status),
  }
}

export function financingSimulation(
  price: number,
  downPaymentPercent: number,
  months: number,
  annualRate = 0.099
) {
  const down = Math.round(price * (downPaymentPercent / 100))
  const financed = Math.max(price - down, 0)
  const monthlyRate = annualRate / 12
  const installment =
    financed === 0
      ? 0
      : Math.round(
          (financed * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)
        )
  return { down, financed, installment, months, downPaymentPercent }
}

export {
  formatCurrency,
  purposeLabel,
  publicPropertyStatusLabels,
}
