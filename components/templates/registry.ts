/**
 * Registry modular de templates.
 * Cada família visual registra metadados; a renderização usa TemplateRenderer + tokens.
 * Não duplica lógica de imóveis/leads/CRM.
 */

import {
  PageTemplate,
  getActiveTemplates,
  getTemplateById,
  getTemplateBySlug,
  loadTemplates,
} from '@/lib/template-marketplace-data'

export type TemplateFamily =
  | 'modern'
  | 'minimal'
  | 'classic'
  | 'luxury'
  | 'launches'
  | 'investment'
  | 'commercial'
  | 'rural'
  | 'condo'
  | 'prestige'

const familyBySlug: Record<string, TemplateFamily> = {
  'modern-horizon': 'modern',
  'minimal-line': 'minimal',
  'classic-estate': 'classic',
  'luxury-atelier': 'luxury',
  'launch-pulse': 'launches',
  'condo-grove': 'condo',
  'invest-grid': 'investment',
  'rural-vista': 'rural',
  'commercial-hub': 'commercial',
  'prestige-suite': 'prestige',
}

export function resolveTemplateFamily(template: PageTemplate): TemplateFamily {
  return familyBySlug[template.slug] || 'modern'
}

export function resolveTemplate(idOrSlug: string): PageTemplate | undefined {
  return getTemplateById(idOrSlug) || getTemplateBySlug(idOrSlug)
}

export function listRenderableTemplates(): PageTemplate[] {
  return getActiveTemplates()
}

export function validateTemplateStatus(template: PageTemplate | undefined): template is PageTemplate {
  return Boolean(template && template.status === 'active')
}

/** Catálogo completo (inclui draft/paused) — uso admin. */
export function listAllTemplatesForAdmin(): PageTemplate[] {
  return loadTemplates()
}

export const templateRegistry = {
  resolveTemplate,
  resolveTemplateFamily,
  listRenderableTemplates,
  validateTemplateStatus,
  listAllTemplatesForAdmin,
}
