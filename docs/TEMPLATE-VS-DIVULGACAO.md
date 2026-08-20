# Fronteira: Galeria de Templates × Divulgação Multicanal

## Status neste repositório

Em `feature/template-marketplace-domains` **não há** arquivos do módulo “Divulgação Multicanal de Imóveis” (feeds XML, portais, extensão de navegador, canais externos).

Busca por `divulgacao`, `multicanal`, `portal-feed`, `xml` nos fontes: nenhum módulo paralelo presente.

## Separação de responsabilidade

| Galeria / Domínios | Divulgação Multicanal |
|--------------------|------------------------|
| Página pública do corretor (`/corretor/:slug`) | Distribuição de imóveis para canais externos |
| Templates visuais, personalização, domínio | Portais, feeds, publicação multi-canal |
| Checkout R$ 97 / 2 meses | Publicação / sincronização externa |
| `lib/template-marketplace-data.ts` | (reservado) `lib/divulgacao-*` ou equivalente |
| `components/templates/*` | (reservado) `components/divulgacao/*` |
| `/meu-site/templates`, `/meu-site/dominio` | (reservado) `/divulgacao`, `/canais`, etc. |
| `/admin/templates`, `/admin/domains` | (reservado) `/admin/divulgacao`, `/admin/canais` |

## Serviços compartilhados (ok reutilizar)

- Autenticação (`lib/auth.ts`)
- Imóveis / corretor (`phase9`, `meu-site-data`, `mock-data`)
- Planos (`phase14`, `plan-access`)
- Notificações (`phase16`)
- Design System

## Namespaces reservados — não usar neste módulo

Para evitar conflito quando o outro módulo entrar:

- `lib/divulgacao-*`, `lib/multichannel-*`, `lib/portal-feed-*`
- `components/divulgacao/**`, `components/multichannel/**`
- Rotas `/divulgacao`, `/canais`, `/feeds`, `/portais`
- Admin `/admin/divulgacao`, `/admin/canais`, `/admin/feeds`
- Chaves localStorage `imovelhub_divulgacao_*`, `imovelhub_feed_*`

## Chaves deste módulo (já em uso)

- `imovelhub_page_templates_v1`
- `imovelhub_template_*`
- `imovelhub_broker_template_*`
- `imovelhub_broker_domains_v1`
- `imovelhub_domain_*`

## Regra de conflito

Se uma alteração futura do módulo paralelo tocar os mesmos arquivos de integração (`phase9`, `meu-site-data`, `public-shell`):

1. Parar sobrescrita cega
2. Documentar o conflito
3. Integrar só via serviços compartilhados (ex.: `getRealtorProperties`)
4. Não misturar UI/checkout/templates com feeds/portais

## Confirmação

Esta branch **não quebra** Divulgação Multicanal porque o módulo ainda não existe neste working tree e os namespaces estão isolados.
