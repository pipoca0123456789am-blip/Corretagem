/**
 * Vínculo cliente ↔ corretor — slug resolvido no servidor.
 * Nunca confiar broker_id/tenant_id do body.
 */

import { getPgPool } from '@/lib/server/store'

export async function upsertClientBrokerLink(input: {
  clientUserId: string
  tenantRealtorId: number
  brokerId: number
  referralSlug: string
  source?: string
}): Promise<void> {
  const pool = getPgPool()
  if (!pool) {
    console.info(
      '[client-broker-link] Sem Postgres — vínculo em memória/log:',
      input.clientUserId,
      input.referralSlug,
      input.tenantRealtorId
    )
    return
  }
  try {
    await pool.query(
      `INSERT INTO public.ih_client_broker_links (
         client_user_id, tenant_realtor_id, broker_id, referral_slug, source
       ) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (client_user_id, tenant_realtor_id) DO UPDATE SET
         broker_id = EXCLUDED.broker_id,
         referral_slug = EXCLUDED.referral_slug,
         source = EXCLUDED.source`,
      [
        input.clientUserId,
        input.tenantRealtorId,
        input.brokerId,
        input.referralSlug,
        input.source || 'portal',
      ]
    )
  } catch (err) {
    console.warn(
      '[client-broker-link] persist falhou',
      err instanceof Error ? err.message : err
    )
  }
}
