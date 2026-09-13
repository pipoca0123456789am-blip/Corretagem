export const adminMetrics = {
  revenue: {
    total: 'R$ 0',
    growth: '0%',
    mtd: 'R$ 0',
  },
  subscriptions: {
    active: 0,
    growth: '0',
    churn: '0%',
  },
  realtors: {
    active: 0,
    newThisMonth: 0,
    avgCommission: 'R$ 0',
  },
  properties: {
    total: 0,
    listed: 0,
    sold: 0,
    leased: 0,
  },
  users: {
    total: 0,
    newThisMonth: 0,
    activeToday: 0,
  },
  support: {
    openTickets: 0,
    avgResolutionTime: '—',
    satisfaction: '—',
  },
  performance: {
    avgDealValue: 'R$ 0',
    conversionRate: '0%',
    avgTimeToSale: '—',
  },
  professional: {
    usersActive: 0,
    revenue: 'R$ 0',
    engagement: '0%',
  },
  ai: {
    usersActive: 0,
    revenue: 'R$ 0',
    requestsDaily: 0,
  },
  requests: {
    pending: 0,
    processing: 0,
    completed: 0,
  },
  audit: {
    eventsToday: 0,
    critical: 0,
    warnings: 0,
  },
}

export const chartData = {
  revenue: [
    { month: 'Jan', value: 0 },
    { month: 'Fev', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Abr', value: 0 },
    { month: 'Mai', value: 0 },
    { month: 'Jun', value: 0 },
  ],
  subscriptions: [
    { month: 'Jan', starter: 0, professional: 0, enterprise: 0 },
    { month: 'Fev', starter: 0, professional: 0, enterprise: 0 },
    { month: 'Mar', starter: 0, professional: 0, enterprise: 0 },
    { month: 'Abr', starter: 0, professional: 0, enterprise: 0 },
    { month: 'Mai', starter: 0, professional: 0, enterprise: 0 },
    { month: 'Jun', starter: 0, professional: 0, enterprise: 0 },
  ],
  churn: [
    { month: 'Jan', churn: 0 },
    { month: 'Fev', churn: 0 },
    { month: 'Mar', churn: 0 },
    { month: 'Abr', churn: 0 },
    { month: 'Mai', churn: 0 },
    { month: 'Jun', churn: 0 },
  ],
  deals: [
    { month: 'Jan', valor: 0 },
    { month: 'Fev', valor: 0 },
    { month: 'Mar', valor: 0 },
    { month: 'Abr', valor: 0 },
    { month: 'Mai', valor: 0 },
    { month: 'Jun', valor: 0 },
  ],
}

export const realtorsList = [
  {
    id: 1,
    name: 'Corretor Demonstração',
    email: 'corretor@plataforma.com.br',
    phone: '(11) 90000-0001',
    region: '—',
    plan: 'essencial',
    status: 'active',
    commissionRate: 0,
    totalSales: 'R$ 0',
    salesThisMonth: 0,
    rating: 0,
    joinedAt: new Date().toISOString().slice(0, 10),
  },
]

export const correctorMetrics = {
  properties: {
    total: 0,
    active: 0,
    sold: 0,
    leased: 0,
  },
  sales: {
    closed: 0,
    pending: 0,
    total: 0,
    conversion: '0%',
  },
  leads: {
    new: 0,
    contacted: 0,
    qualified: 0,
    lost: 0,
  },
  revenue: {
    thisMonth: 'R$ 0',
    ytd: 'R$ 0',
    growth: '0%',
  },
  performance: {
    avgTimeToSale: '—',
    avgDealValue: 'R$ 0',
    commissionRate: '0%',
  },
  rating: {
    score: 0,
    reviews: 0,
    responseTime: '—',
  },
  profile: {
    views: 0,
    contacts: 0,
    conversionRate: '0%',
  },
  clients: {
    total: 0,
    active: 0,
    repeat: 0,
  },
}

/** Lista tipada vazia — evita `never[]` após remoção dos mocks de imóveis. */
export type MockProperty = {
  id: number
  title: string
  address: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  garage: number
  status: 'available' | 'sold' | 'rented' | 'pending' | 'published'
  type: string
  image: string
  description: string
  views: number
  contacts: number
  shares: number
  favorites: number
  visits: number
  createdAt: string
  updatedAt: string
  owner: { name: string; email: string }
  realtor: { id: number; name: string }
  features: string[]
}

export const propertiesList: MockProperty[] = []
