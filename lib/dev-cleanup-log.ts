/**
 * Registro da limpeza de desenvolvimento (sem banco SQL neste protótipo).
 *
 * Ambiente: desenvolvimento local (Next.js + localStorage + mocks em /lib)
 * Produção: NÃO executar resetDevLocalData em produção.
 *
 * Backup lógico: estado anterior vivia em localStorage + arrays mock.
 * Após seed v1 (2026-07-28):
 * - sessões antigas removidas na primeira carga (ensureCleanDevSeed)
 * - realtorsList reduzido a 1 corretor demo
 * - propertiesList reduzido a 3 imóveis do corretor 1
 * - usuários canônicos em DEV_SEED_USERS (lib/auth.ts)
 */

export const DEV_CLEANUP_LOG = {
  environment: 'development',
  isProduction: false,
  performedAt: '2026-07-28',
  seedVersion: '2026-07-28-v1',
  preserved: ['estrutura de rotas', 'módulos de UI', 'migrations N/A (sem DB SQL)', 'design system'],
  removed: [
    'sessões/localStorage legados',
    'usuários demo antigos (admin@imovel.hub, carlos.silva@...)',
    'corretores fictícios extras na lista principal',
    'imóveis de outros corretores na lista principal',
  ],
  created: {
    users: [
      'admin@plataforma.com.br (super_admin)',
      'corretor@plataforma.com.br (corretor, realtorId=1)',
      'cliente@plataforma.com.br (cliente, realtorId=1)',
    ],
    properties: 3,
    notes: 'Demais módulos (agenda, IA, página profissional) ainda usam mocks por fase; filtro por realtorId aplica isolamento.',
  },
}
