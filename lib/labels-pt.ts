/** Rótulos de interface em português (pt-BR). */

export const propertyStatusLabels: Record<string, string> = {
  available: 'Disponível',
  published: 'Publicado',
  approved: 'Aprovado',
  draft: 'Rascunho',
  ready: 'Pronto para publicar',
  sold: 'Vendido',
  rented: 'Alugado',
  pending: 'Pendente',
  under_review: 'Em análise',
  reserved: 'Reservado',
  unavailable: 'Indisponível',
}

export const propertyTypeLabels: Record<string, string> = {
  all: 'Todos',
  apartment: 'Apartamento',
  house: 'Casa',
  commercial: 'Comercial',
  land: 'Terreno',
}

export const planNameLabels: Record<string, string> = {
  starter: 'Essencial',
  professional: 'Profissional',
  enterprise: 'Empresarial',
  premium: 'Premium',
  free: 'Gratuito',
  inicial: 'Essencial',
  essencial: 'Essencial',
  profissional: 'Profissional',
  empresarial: 'Empresarial',
}

export const serviceStatusLabels: Record<string, string> = {
  ativo: 'Ativo',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
  trial: 'Período de teste',
}

export const materialStatusLabels: Record<string, string> = {
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  pendente: 'Pendente',
}

export const aiConversationStatusLabels: Record<string, string> = {
  ia: 'IA',
  humano: 'Humano',
  pausado: 'Pausado',
  ativo: 'Ativo',
  encerrado: 'Encerrado',
}

export function labelPt(map: Record<string, string>, value: string): string {
  return map[value] ?? map[value.toLowerCase()] ?? value
}
