/**
 * Dataset demo para APIs de domínio (fail-closed + filtro por tenant da sessão).
 * Não aceitar realtorId/broker_id do client — sempre session.realtorId.
 */

export interface DemoProperty {
  id: string
  title: string
  realtorId: number
  city: string
  status: 'ativo' | 'rascunho'
}

export interface DemoClient {
  id: string
  name: string
  email: string
  realtorId: number
}

export interface DemoLead {
  id: string
  name: string
  source: string
  realtorId: number | null
  email?: string
  phone?: string
  status?: 'novo'
  createdAt?: string
  /** null = lead de plataforma (só admin) */
}

export interface DemoDocument {
  id: string
  title: string
  realtorId: number
  clientId: string
}

const PROPERTIES: DemoProperty[] = [
  { id: 'p-1', title: 'Apartamento Centro', realtorId: 1, city: 'São Paulo', status: 'ativo' },
  { id: 'p-2', title: 'Casa Jardins', realtorId: 1, city: 'São Paulo', status: 'ativo' },
  { id: 'p-9', title: 'Cobertura Outro Corretor', realtorId: 99, city: 'Campinas', status: 'ativo' },
]

const CLIENTS: DemoClient[] = [
  { id: 'c-1', name: 'Cliente Demonstração', email: 'cliente@plataforma.com.br', realtorId: 1 },
  { id: 'c-9', name: 'Cliente Outro', email: 'outro@example.com', realtorId: 99 },
]

const LEADS: DemoLead[] = [
  { id: 'l-1', name: 'Lead Site', source: 'site', realtorId: 1 },
  { id: 'l-plat', name: 'Lead Plataforma', source: 'ads', realtorId: null },
  { id: 'l-9', name: 'Lead Outro', source: 'whatsapp', realtorId: 99 },
]

const DOCUMENTS: DemoDocument[] = [
  { id: 'd-1', title: 'Contrato proposta', realtorId: 1, clientId: 'c-1' },
  { id: 'd-9', title: 'Doc outro tenant', realtorId: 99, clientId: 'c-9' },
]

export function listPropertiesForTenant(realtorId: number): DemoProperty[] {
  return PROPERTIES.filter((p) => p.realtorId === realtorId)
}

export function listClientsForTenant(realtorId: number): DemoClient[] {
  return CLIENTS.filter((c) => c.realtorId === realtorId)
}

export function listLeadsForBroker(realtorId: number): DemoLead[] {
  return LEADS.filter((l) => l.realtorId === realtorId)
}

export function listLeadsForAdmin(): DemoLead[] {
  return [...LEADS]
}

export function listDocumentsForTenant(realtorId: number): DemoDocument[] {
  return DOCUMENTS.filter((d) => d.realtorId === realtorId)
}
