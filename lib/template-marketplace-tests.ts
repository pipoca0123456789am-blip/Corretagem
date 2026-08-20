/**
 * Testes unitários leves do marketplace (executáveis em ambiente com DOM/localStorage).
 */

import {
  assertBrokerOwnership,
  confirmTemplatePayment,
  defaultTemplates,
  getMarketplaceConfig,
  getTemplatePrice,
  saveMarketplaceConfig,
  saveTemplates,
  searchDomains,
  startExistingDomainConnection,
  startTemplateCheckout,
} from '@/lib/template-marketplace-data'

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

export function runTemplateMarketplaceSmokeTests() {
  if (typeof window === 'undefined') return { ok: false, reason: 'needs window' }

  saveMarketplaceConfig({ templatePrice: 97, templateDurationMonths: 2 })
  assert(getMarketplaceConfig().templatePrice === 97, 'config price')

  const active = defaultTemplates.find((t) => t.status === 'active')!
  const price = getTemplatePrice(active)
  assert(price === 97, 'official price from config')

  const sub = startTemplateCheckout(active.id, 1)
  const confirmed = confirmTemplatePayment(sub.id, 1) // preço manipulado
  assert(confirmed.price === 97, 'ignores client price')
  assert(confirmed.status === 'active', 'activated')
  assert(!!confirmed.expiresAt, 'has expiry')

  const paused = { ...active, id: 'tpl-test-paused', slug: 'test-paused', status: 'paused' as const }
  saveTemplates([...defaultTemplates, paused])
  let blocked = false
  try {
    startTemplateCheckout('tpl-test-paused', 1)
  } catch {
    blocked = true
  }
  assert(blocked, 'inactive template blocked')

  const unique = `meu-teste-${Date.now()}.com.br`
  startExistingDomainConnection(1, unique)
  let dup = false
  try {
    startExistingDomainConnection(1, unique)
  } catch {
    dup = true
  }
  assert(dup, 'duplicate domain blocked')

  // Isolamento: com sessão simulada no localStorage de auth, se existir
  try {
    assertBrokerOwnership(99, 1)
    assert(false, 'should have thrown cross-broker')
  } catch (e) {
    assert(e instanceof Error && e.message.includes('Acesso negado'), 'cross-broker blocked')
  }

  const results = searchDomains('joaosilvaimoveis')
  assert(results.length >= 3, 'domain search returns extensions')
  assert(results.some((r) => r.extension === 'com.br'), 'has com.br')

  return { ok: true, tests: 8 }
}
