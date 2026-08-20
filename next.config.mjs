/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // URLs curtas do site automático do corretor: /slug → /corretor/slug
      // Rotas de app existentes (login, dashboard, admin…) têm prioridade sobre rewrites.
      { source: '/:slug/imoveis', destination: '/corretor/:slug/imoveis' },
      { source: '/:slug/imovel/:propertySlug', destination: '/corretor/:slug/imovel/:propertySlug' },
      { source: '/:slug/cadastro', destination: '/corretor/:slug/cadastro' },
      { source: '/:slug/login', destination: '/corretor/:slug/login' },
      { source: '/:slug/encontrar', destination: '/corretor/:slug/encontrar' },
      { source: '/:slug/contato', destination: '/corretor/:slug/contato' },
      { source: '/:slug/sobre', destination: '/corretor/:slug/sobre' },
      { source: '/:slug/avaliacao', destination: '/corretor/:slug/avaliacao' },
      { source: '/:slug/campanha', destination: '/corretor/:slug/campanha' },
      { source: '/:slug', destination: '/corretor/:slug' },
    ]
  },
  async redirects() {
    return [
      // Admin PT → rotas internas existentes
      { source: '/admin/corretores', destination: '/admin/realtors', permanent: false },
      { source: '/admin/corretores/:id', destination: '/admin/realtors/:id', permanent: false },
      { source: '/admin/usuarios', destination: '/admin/users', permanent: false },
      { source: '/admin/imoveis', destination: '/admin/properties', permanent: false },
      { source: '/admin/assinaturas', destination: '/admin/subscriptions', permanent: false },
      { source: '/admin/assinaturas/:id', destination: '/admin/subscriptions/:id', permanent: false },
      { source: '/admin/financeiro', destination: '/admin/financial', permanent: false },
      { source: '/admin/solicitacoes', destination: '/admin/requests', permanent: false },
      { source: '/admin/solicitacoes/:id', destination: '/admin/requests/:id', permanent: false },
      { source: '/admin/paginas-profissionais', destination: '/admin/professional', permanent: false },
      { source: '/admin/paginas-profissionais/:id', destination: '/admin/professional/:id', permanent: false },
      { source: '/admin/agentes-ia', destination: '/admin/ai', permanent: false },
      { source: '/admin/agentes-ia/:id', destination: '/admin/ai/:id', permanent: false },
      { source: '/admin/suporte', destination: '/admin/support', permanent: false },
      { source: '/admin/suporte/:id', destination: '/admin/support/:id', permanent: false },
      { source: '/admin/comunicacao', destination: '/admin/communication', permanent: false },
      { source: '/admin/relatorios', destination: '/admin/reports', permanent: false },
      { source: '/admin/auditoria', destination: '/admin/audit', permanent: false },
      { source: '/admin/configuracoes', destination: '/admin/settings', permanent: false },

      // Corretor PT → rotas existentes (módulos preservados)
      { source: '/cadastro', destination: '/signup', permanent: false },
      { source: '/esqueci-senha', destination: '/forgot-password', permanent: false },
      { source: '/redefinir-senha', destination: '/forgot-password', permanent: false },
      { source: '/imoveis', destination: '/properties', permanent: false },
      { source: '/imoveis/:path*', destination: '/properties/:path*', permanent: false },
      { source: '/clientes', destination: '/clients', permanent: false },
      { source: '/clientes/:path*', destination: '/clients/:path*', permanent: false },
      { source: '/crm', destination: '/clients', permanent: false },
      { source: '/negociacoes', destination: '/negotiations', permanent: false },
      { source: '/negociacoes/:path*', destination: '/negotiations/:path*', permanent: false },
      { source: '/financeiro', destination: '/financial', permanent: false },
      { source: '/financeiro/:path*', destination: '/financial/:path*', permanent: false },
      { source: '/minha-pagina', destination: '/professional', permanent: false },
      { source: '/minha-pagina/:path*', destination: '/professional/:path*', permanent: false },
      { source: '/minha-ia', destination: '/ai', permanent: false },
      { source: '/minha-ia/:path*', destination: '/ai/:path*', permanent: false },
      { source: '/campanhas', destination: '/professional', permanent: false },
      { source: '/assinatura', destination: '/plans', permanent: false },
      { source: '/assinatura/:path*', destination: '/plans/:path*', permanent: false },
      { source: '/suporte', destination: '/help', permanent: false },
      { source: '/suporte/:path*', destination: '/help/:path*', permanent: false },
      { source: '/configuracoes', destination: '/settings', permanent: false },
      { source: '/configuracoes/aplicativo', destination: '/settings/aplicativo', permanent: false },
      { source: '/visitas', destination: '/visits', permanent: false },
      { source: '/visitas/:path*', destination: '/visits/:path*', permanent: false },
    ]
  },
}

export default nextConfig
