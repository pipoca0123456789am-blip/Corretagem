/**
 * Logs de acesso de leads / visitantes das vitrines públicas.
 * Persistência local (protótipo) — em produção deve ir para backend auditável.
 */

import { publicRealtorProfiles } from '@/lib/phase9-data'

const STORAGE_KEY = 'imovelhub_access_logs_v1'
const MAX_LOGS = 500

export type AccessLogAction =
  | 'site_view'
  | 'property_view'
  | 'lead_submit'
  | 'client_signup'
  | 'contact'
  | 'visit_request'
  | 'login_client'
  | 'admin_login'
  | 'app_login'

export interface AccessLogEntry {
  id: string
  at: string
  action: AccessLogAction
  realtorId: number | null
  realtorName: string
  leadId?: string
  leadName?: string
  leadEmail?: string
  leadPhone?: string
  path: string
  source: string
  userAgent: string
  referrer: string
  detail?: string
}

export const accessLogActionLabels: Record<AccessLogAction, string> = {
  site_view: 'Visita à vitrine',
  property_view: 'Visualizou imóvel',
  lead_submit: 'Lead capturado',
  client_signup: 'Cadastro de cliente',
  contact: 'Contato / formulário',
  visit_request: 'Pedido de visita',
  login_client: 'Login cliente',
  admin_login: 'Login admin',
  app_login: 'Login corretor',
}

function loadLogs(): AccessLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AccessLogEntry[]) : []
  } catch {
    return []
  }
}

function saveLogs(list: AccessLogEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_LOGS)))
}

function browserMeta() {
  if (typeof window === 'undefined') {
    return { path: '', userAgent: '', referrer: '' }
  }
  return {
    path: window.location.pathname + window.location.search,
    userAgent: navigator.userAgent.slice(0, 220),
    referrer: document.referrer || 'direto',
  }
}

function realtorName(id: number | null | undefined) {
  if (!id) return '—'
  return publicRealtorProfiles.find((p) => p.id === id)?.name || `Corretor #${id}`
}

export function recordAccessLog(
  input: Omit<AccessLogEntry, 'id' | 'at' | 'path' | 'userAgent' | 'referrer' | 'realtorName'> & {
    realtorName?: string
    path?: string
    detail?: string
  }
): AccessLogEntry | null {
  if (typeof window === 'undefined') return null
  const meta = browserMeta()
  const entry: AccessLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    action: input.action,
    realtorId: input.realtorId,
    realtorName: input.realtorName || realtorName(input.realtorId),
    leadId: input.leadId,
    leadName: input.leadName,
    leadEmail: input.leadEmail,
    leadPhone: input.leadPhone,
    path: input.path || meta.path,
    source: input.source,
    userAgent: meta.userAgent,
    referrer: meta.referrer,
    detail: input.detail,
  }
  const list = loadLogs()
  list.unshift(entry)
  saveLogs(list)
  return entry
}

export function getAccessLogs(limit = 200): AccessLogEntry[] {
  return loadLogs().slice(0, limit)
}

export function getAccessLogsByRealtor(realtorId: number, limit = 100): AccessLogEntry[] {
  return loadLogs()
    .filter((l) => l.realtorId === realtorId)
    .slice(0, limit)
}

export function getAccessLogsByLeadEmail(email: string, limit = 50): AccessLogEntry[] {
  const e = email.trim().toLowerCase()
  return loadLogs()
    .filter((l) => (l.leadEmail || '').toLowerCase() === e)
    .slice(0, limit)
}

export function clearAccessLogs() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export { STORAGE_KEY as ACCESS_LOGS_STORAGE_KEY }
