# Marketplace de Templates Profissionais e Domínios

## Visão geral

Módulo comercial complementar ao SaaS ImóvelHub, **sem substituir**:

1. **Meu Site automático** — incluído na assinatura (`/meu-site`, rotas `/corretor/:slug`)
2. **Template Profissional** — galeria, R$ 97 / 2 meses (configurável), validade e renovação
3. **Página Profissional Premium** — R$ 497 (`/professional`, phase12) — intacta
4. **Domínio próprio** — conexão DNS + busca/pedido (provider manual)

## Stack

- Next.js (App Router) + React + TypeScript + Tailwind + Design System existente
- Persistência: `localStorage` (protótipo). Schema tipado em `lib/template-marketplace-data.ts` espelha tabelas futuras SQL
- Sem backend SQL neste repositório; “migrations” = chaves versionadas + interfaces

## Conflito com Divulgação Multicanal

Ver `docs/TEMPLATE-VS-DIVULGACAO.md`. Neste repositório o módulo paralelo **ainda não existe**. Namespaces e rotas estão isolados; serviços compartilhados (auth, imóveis, planos) podem ser reutilizados sem misturar UI.

## Branch

`feature/template-marketplace-domains` (repositório git inicializado no projeto)

## Arquitetura

```
lib/template-marketplace-data.ts   # catálogo, subs, custom, preços, métricas, isolamento
lib/domains/domain-provider.ts     # DomainProviderAdapter (manual)
components/templates/registry.ts   # resolveTemplate / famílias
components/templates/shared/       # reexports DS + chrome público
components/templates/template-renderer.tsx
components/meu-site/meu-site-nav.tsx
app/(app)/meu-site/*               # Visão geral, imóveis, templates, Meu Domínio, métricas
app/admin/(panel)/templates|domains
docs/TEMPLATE-VS-DIVULGACAO.md     # fronteira com módulo paralelo
```

### TemplateRenderer

- Resolve template ativo do corretor
- Carrega imóveis via `getRealtorProperties` (phase9)
- Personalização via `broker_template_customizations` (localStorage)
- Na home pública: se assinatura `active`/`expiring` → renderer; senão Meu Site básico
- Vencimento: status `expired` → volta ao básico **sem apagar** dados/SEO/domínio/métricas

### Checkout

- Preço sempre de `getMarketplaceConfig()` / `getTemplatePrice()` no “backend” mock
- Campo manipulável no UI é **ignorado** em `confirmTemplatePayment`
- Pagamento simulado; Super Admin pode ativar manualmente

### Domínios

- Adapter `manualDomainProvider` — busca simulada, pedido `manual_processing`
- Domínio existente: gera A/CNAME/TXT, não pede senha do registrador
- Admin marca registro/validação

## Isolamento

- Assinaturas e domínios filtrados por `realtorId` da sessão (`getCurrentRealtorId`)
- Leads do site já entram no CRM do corretor (`meu-site-data`)
- Template não cria segunda URL pública

## Rotas corretor

| Rota | Função |
|------|--------|
| `/meu-site` | Visão geral + status template |
| `/meu-site/templates` | Galeria |
| `/meu-site/templates/[slug]` | Demo desktop/tablet/mobile |
| `/meu-site/templates/checkout` | Contratação / renovação |
| `/meu-site/dominio` | Conectar / comprar |
| `/meu-site/metricas` | Métricas |
| `/meu-site/imoveis` | Imóveis no site |

## Rotas admin

| Rota | Função |
|------|--------|
| `/admin/templates` | Catálogo, preços, categorias, ativações |
| `/admin/domains` | Pedidos e conexões DNS |

## Variáveis / chaves localStorage

- `imovelhub_page_templates_v1`
- `imovelhub_template_categories_v1`
- `imovelhub_broker_template_subs_v1`
- `imovelhub_broker_template_custom_v1`
- `imovelhub_broker_domains_v1`
- `imovelhub_domain_orders_v1`
- `imovelhub_template_marketplace_config_v1`
- `imovelhub_template_metrics_v1`
- `imovelhub_template_history_v1`

## Como testar (manual)

1. Login corretor → `/meu-site/templates`
2. Abrir demonstração (dados fictícios) — site público não muda
3. Escolher template → checkout → confirmar (preço oficial R$ 97)
4. Abrir `/{slug}` — layout do template
5. Manipular preço no checkout → backend aplica valor oficial
6. Renovar / trocar / voltar ao básico
7. Domínio: conectar existente ou buscar → pedido manual
8. Admin: `/admin/templates` e `/admin/domains`
9. Confirmar `/professional` (R$ 497) intacto

## Rollback

Remover uso de `getActiveBrokerTemplate` na home pública e páginas `/meu-site/templates*` / domínio; limpar chaves `imovelhub_*template*` e `imovelhub_*domain*` no localStorage.

## Futuro (SQL)

Entidades sugeridas no prompt mestre mapeiam 1:1 com as interfaces TypeScript atuais. Substituir `loadJSON`/`saveJSON` por repositories + RLS por `tenant_id`/`broker_id`.
