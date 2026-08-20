/**
 * Abstração de provedor de domínio.
 * Modo atual: manual (sem registro automático falso).
 */

export interface DomainAvailability {
  domain: string
  extension: string
  available: boolean
  registrationPrice: number
  renewalPrice: number
  serviceFee: number
}

export interface DomainProviderAdapter {
  id: string
  name: string
  search(query: string): Promise<DomainAvailability[]>
  checkAvailability(domain: string): Promise<boolean>
  getRegistrationPrice(domain: string): Promise<number>
  getRenewalPrice(domain: string): Promise<number>
  register(domain: string, years: number): Promise<{ externalOrderId: string; status: 'manual_processing' }>
  renew(domain: string, years: number): Promise<{ status: 'manual_processing' }>
  getStatus(externalId: string): Promise<string>
  configureDns(
    domain: string,
    records: { type: string; host: string; value: string }[]
  ): Promise<{ ok: boolean; message: string }>
  verifyOwnership(domain: string, token: string): Promise<{ verified: boolean }>
  cancel(externalId: string): Promise<void>
}

import { searchDomains, getMarketplaceConfig } from '@/lib/template-marketplace-data'

export const manualDomainProvider: DomainProviderAdapter = {
  id: 'manual',
  name: 'Processamento manual (assistido)',
  async search(query) {
    return searchDomains(query)
  },
  async checkAvailability(domain) {
    const results = searchDomains(domain)
    return results.find((r) => r.domain === domain)?.available ?? false
  },
  async getRegistrationPrice(domain) {
    const results = searchDomains(domain)
    return results.find((r) => r.domain === domain)?.registrationPrice ?? 80
  },
  async getRenewalPrice(domain) {
    const results = searchDomains(domain)
    return results.find((r) => r.domain === domain)?.renewalPrice ?? 80
  },
  async register() {
    return { externalOrderId: `manual-${Date.now()}`, status: 'manual_processing' }
  },
  async renew() {
    return { status: 'manual_processing' }
  },
  async getStatus() {
    return 'manual_processing'
  },
  async configureDns() {
    return {
      ok: true,
      message: 'Instruções DNS geradas. Configure no registrador e aguarde validação.',
    }
  },
  async verifyOwnership() {
    // Protótipo: validação simulada pelo Super Admin / botão de teste
    return { verified: false }
  },
  async cancel() {
    /* no-op */
  },
}

export function getActiveDomainProvider(): DomainProviderAdapter {
  void getMarketplaceConfig()
  return manualDomainProvider
}
