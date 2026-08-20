# ImóvelHub — Documentação técnica de handoff (Cursor)

**Produto:** SaaS imobiliário multiusuário (protótipo navegável)  
**Stack atual:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript · Design System próprio  
**Moeda:** BRL (R$) · **Idioma:** pt-BR  
**Estado:** demonstração frontend sem backend, pagamentos, WhatsApp ou IA reais  

> **Valores preservados**  
> - Página profissional: **R$ 497** (pagamento único de referência)  
> - Template profissional: **R$ 97 / 2 meses** (configurável no Super Admin)  
> - Domínio próprio: **a partir de R$ 69,90/ano** (taxa provisória + registro por extensão)  
> - Integração IA + WhatsApp: **R$ 97** (valor inicial **sugerido** / provisório)  
> - Planos mensais (Essencial R$ 69,90 · Profissional R$ 149,90 · Premium R$ 299,90): **provisórios — não finais**
> - Anuais: R$ 699 · R$ 1.499 · R$ 2.999

---

## Como usar este documento no Cursor

1. Tratar este arquivo como fonte de verdade de produto/regras do protótipo.  
2. Ao implementar backend, **não alterar** fluxos, rotas e identidade visual aprovados sem autorização.  
3. Pontos marcados com `[NÃO DEFINIDO]` exigem decisão de negócio/tecnologia antes de produção.  
4. Diferenciar sempre: **regra visual** (UI do protótipo) × **regra técnica** (persistência, segurança, API).

**Mapa de dados mock no repositório**

| Arquivo | Módulo |
|---------|--------|
| `lib/auth.ts` | Sessão mock / papéis |
| `lib/mock-data.ts` | Corretores, imóveis base, métricas |
| `lib/phase7-data.ts` | Agenda, visitas, negociações + `filterByRealtor` |
| `lib/phase8-data.ts` | Financeiro do corretor |
| `lib/phase9-data.ts` / `phase10-data.ts` | Página pública corretor/imóvel |
| `lib/phase11-data.ts` | Área do cliente |
| `lib/phase12-data.ts` | Página profissional (R$ 497) |
| `lib/phase13-data.ts` | IA + WhatsApp (R$ 97) |
| `lib/phase14-data.ts` | Planos / assinaturas / faturas |
| `lib/phase16-data.ts` | Suporte / solicitações / notificações |
| `lib/phase17-data.ts` | Relatórios / analytics |
| `lib/template-marketplace-data.ts` | Templates profissionais + domínio (localStorage) |
| `lib/domains/domain-provider.ts` | Adapter de provedor de domínio (manual) |
| `lib/meu-site-data.ts` | Meu Site automático / leads / slug |
| `components/design-system/*` | UI kit |
| `components/marketing/landing-page.tsx` | Landing comercial |
| `app/(app)/*` | App autenticado |
| `app/corretor/*` | Vitrine pública |
| `app/cliente/*` | Portal do cliente |

---

## 1. Visão geral do produto

O **ImóvelHub** é uma plataforma SaaS para corretores de imóveis (autônomos, equipes e pequenas imobiliárias) com:

- gestão de imóveis, CRM/leads, agenda, visitas, negociações e financeiro;
- presença digital (página pública do corretor + página do imóvel);
- área privada do cliente vinculada a **um** corretor;
- página profissional sob demanda (R$ 497);
- IA individual integrada ao WhatsApp (R$ 97 sugerido);
- planos/assinaturas, suporte, solicitações, notificações e relatórios;
- Super Admin com visão global da plataforma.

**Promessa central de produto:** organização, produtividade, atendimento profissional, centralização, automação, conversão, presença digital, IA — com **exclusividade da carteira** e **ausência de concorrência interna**.

**O que o protótipo NÃO faz (regra técnica atual):** backend, cobrança real, envio real de e-mail/push/WhatsApp, upload real de arquivos, IA real, exportação real de relatórios.

---

## 2. Perfis de usuário

| Perfil | Implementado no protótipo? | Como acessa (demo) |
|--------|----------------------------|--------------------|
| Super Admin | Sim | E-mail contendo `admin` |
| Agente de suporte | Sim (parcial) | E-mail contendo `suporte` |
| Corretor | Sim | Demais e-mails |
| Assistente / usuário adicional | Conceitual (equipe/solicitação) | `[NÃO DEFINIDO]` login próprio |
| Proprietário (dono do imóvel) | Conceitual (dados no imóvel) | `[NÃO DEFINIDO]` portal próprio |
| Cliente final | Sim | `/cliente/[slug]/…` |
| Visitante (landing) | Sim | `/` deslogado |

---

## 3. Super Admin

**Objetivo:** operar a plataforma como um todo.

**Acesso tipico:** `/admin/dashboard` e módulos `/admin/*`.

**Capacidades (protótipo):**

- dashboard global e relatórios da plataforma;
- corretores, usuários, imóveis globais;
- área do cliente (visão admin);
- assinaturas/planos/cupons;
- financeiro da plataforma;
- solicitações e página profissional;
- agentes de IA;
- suporte (fila, SLA visual, notas internas);
- comunicação, auditoria, configurações.

**Regra:** visão **global**; não substitui o isolamento das carteiras entre corretores.

---

## 4. Usuários administrativos

Além do Super Admin, o protótipo prevê **agente de suporte** (`support_agent`):

- menu limitado: fila de suporte, solicitações, notificações;
- vê chamados novos e atribuídos;
- **não** deve ver observações internas? → no protótipo o suporte **vê** notas internas (ferramenta operacional);
- corretor **nunca** vê notas internas.

**Outros papéis administrativos** (financeiro, produção de páginas, ops): `[NÃO DEFINIDO]` — sugeridos na matriz, não implementados como roles distintos.

---

## 5. Corretor

**Persona principal do SaaS.** Opera a própria carteira em `/dashboard` e módulos do menu corretor.

**Inclui:** imóveis, clientes, agenda, visitas, negociações, financeiro, ofertas, relatórios, documentos, página profissional, IA, planos, solicitações, notificações, perfil, configurações, ajuda/chamados.

**Isolamento:** `realtorId` + `filterByRealtor` / helpers equivalentes.

---

## 6. Assistente

**Regra de produto:** usuário adicional da conta do corretor (limites por plano: 1 / 3 / 10).

**No protótipo:** tela `/team` + tipo de solicitação `usuario_adicional`.

**`[NÃO DEFINIDO]`**

- escopos granulares (só agenda, só CRM, sem financeiro, etc.);
- convite por e-mail;
- faturamento do usuário extra (existe referência provisória R$ 79 em solicitações).

---

## 7. Proprietário

Aparece como dados do imóvel (`owner` em mocks) e em fluxos de negociação (“aguardando proprietário”).

**`[NÃO DEFINIDO]`:** portal do proprietário, login, documentos exclusivos, assinatura de autorização de venda/locação.

---

## 8. Cliente

Cliente final vinculado a **um corretor de origem** (slug do corretor na URL).

**Rotas:** `/cliente/[slug]/…`  
**Demo citada no produto:** `ana.cliente@email.com` / fluxo Marina (ver dados em `phase11`).

**Capacidades:** login/cadastro/termos/onboarding, favoritos, comparação, recomendações, visitas, propostas, mensagens, documentos, perfil, preferências, financeiro (com consentimento), histórico.

---

## 9. Permissões (resumo)

| Recurso | Corretor | Assistente | Suporte | Super Admin | Cliente |
|---------|----------|------------|---------|-------------|---------|
| Dados da própria carteira | R/W | `[NÃO DEFINIDO]` | — | R (global) | — |
| Dados de outro corretor | Negado | Negado | Limitado* | Sim | Negado |
| Notas internas de suporte | Negado | Negado | Sim | Sim | Negado |
| Portal cliente (do corretor X) | Gestão | `[NÃO DEFINIDO]` | — | Monitoramento | Só se vinculado a X |
| Configurar IA da carteira | Sim | `[NÃO DEFINIDO]` | — | Global | Negado |
| Editar planos/preços | Não | Não | Não | Sim | Não |
| Assumir conversa WhatsApp | Sim (própria) | `[NÃO DEFINIDO]` | — | Visão global | Não |

\*Suporte: tickets/solicitações conforme atribuição — **não** carteira comercial completa.

---

## 10. Matriz de acesso (rotas × papel)

| Área | Corretor | Suporte | Super Admin | Cliente | Público |
|------|----------|---------|-------------|---------|---------|
| `/` landing | redireciona logado | redireciona | redireciona | — | Sim |
| `/(auth)/*` | Sim | Sim | Sim | — | Sim |
| `/(app)/*` painel | Sim | Parcial | Sim (admin) | Não | Não |
| `/admin/*` | Não | Parcial | Sim | Não | Não |
| `/corretor/[slug]/*` | — | — | — | — | Sim |
| `/cliente/[slug]/*` | — | — | Monitor | Sim | Cadastro/login públicos do slug |
| `/design-system` | Dev | Dev | Dev | — | Sim (prototipo) |

**Regra visual:** menus laterais diferentes por papel (`components/layout/sidebar.tsx`).  
**Regra técnica futura:** middleware/RBAC no servidor (hoje: checagens client-side + `localStorage`).

---

## 11. Regra de isolamento por corretor

**Regra de negócio (aprovada):**

1. Imóveis, clientes/leads, agenda, visitas, negociações, financeiro, documentos, conversas de IA, chamados e solicitações pertencem a um `realtorId`.  
2. Corretor **só** vê os próprios registros.  
3. Não há mural compartilhado de imóveis entre corretores (sem concorrência interna).  
4. Imóveis “semelhantes” na página pública vêm **do mesmo corretor**.  
5. Super Admin vê agregados e listas globais **sem misturar carteiras na operação do corretor**.

**Regra técnica no protótipo:** `getCurrentRealtorId()` + `filterByRealtor()` em `lib/phase7-data.ts` e equivalentes nos `phase*-data.ts`. Persistência demo: `localStorage`.

**Risco:** checagem só no client — em produção **obrigatório** RLS/tenant no banco + autorização na API.

---

## 12. Regra de vinculação do cliente

1. Cliente se cadastra/loga no contexto `/cliente/[slug]` do corretor.  
2. Dados do cliente (favoritos, propostas, mensagens, docs) ficam sob o corretor de origem.  
3. Cliente **não** navega carteiras de outros corretores na mesma sessão.  
4. Troca de corretor / portabilidade: `[NÃO DEFINIDO]`.

---

## 13. Regra da IA individual

1. Um agente por corretor/carteira.  
2. Conhecimento e leads **não** cruzam carteiras.  
3. Corretor pode pausar/ativar, assumir e devolver atendimento humano.  
4. Valor inicial sugerido: **R$ 97** (`AI_INTEGRATION_PRICE`, `AI_PRICE_PROVISIONAL = true`).  
5. Mensalidade de consumo da IA: referência provisória R$ 97/mês no catálogo de add-ons — **não definitiva**.  
6. Integração WhatsApp no protótipo: **simulada**.

---

## 14. Lista completa de telas (inventário)

### Marketing / institucional
- `/` Landing comercial  
- `/termos` · `/privacidade` · `/contato`  
- `/design-system` (catálogo DS)

### Auth
- `/login` · `/signup` · `/forgot-password` · `/logout`

### Corretor (app)
- Dashboard, imóveis (lista/criar/detalhe/editar), clientes, agenda, visitas, negociações (+ subfluxos), financeiro (+ subpáginas), ofertas, relatórios, documentos, equipe, integrações, onboarding, perfil, settings  
- Professional (hub + benefícios, exemplos, modelos, comparação, solicitar, checkout, confirmação, acompanhamento, ajustes, aprovação, publicada, métricas)  
- AI (hub + benefícios, exemplos, solicitar, checkout, configuração, conversas, métricas, consumo, histórico, alertas)  
- Plans (lista, checkout, confirmação, atual, faturas, histórico)  
- Solicitações, notificações, ajuda, chamados

### Super Admin
- Dashboard, corretores, usuários, client-portal, properties, subscriptions, financial, requests, professional, ai, support, communication, reports, audit, settings  
- Agenda/visitas/negotiations/financial compartilhados (visão ampla no protótipo)

### Público corretor
- `/corretor` · `/corretor/[slug]` · imóveis · imóvel · sobre · contato · campanha · avaliação

### Cliente
- Entrada `/cliente` · portal completo sob `/cliente/[slug]/…` (login, cadastro, termos, onboarding, home, favoritos, comparacao, recomendados, novos, visualizados, descartados, visitas, propostas, mensagens, documentos, perfil, preferencias, financeiro, historico, meu-corretor, recuperar-senha)

---

## 15. Rotas públicas

| Rota | Descrição |
|------|-----------|
| `/` | Landing (se não autenticado) |
| `/login`, `/signup`, `/forgot-password` | Auth corretor/admin |
| `/termos`, `/privacidade`, `/contato` | Institucional |
| `/corretor/**` | Vitrine pública |
| `/cliente/[slug]/login|cadastro|termos|recuperar-senha` | Entrada do cliente |
| `/design-system` | DS (dev) |

---

## 16. Rotas privadas (autenticadas)

Tudo sob `app/(app)/` exige sessão mock (`isAuthenticated`).  
Cliente autenticado usa chaves `client*` no `localStorage` (sessão separada).

---

## 17. Rotas do Super Admin

Prefixo `/admin/*` (lista na seção 14). Guardas client-side: `isSuperAdmin()` (e suporte em support/requests/reports).

---

## 18. Rotas do corretor

Prefixos principais: `/dashboard`, `/properties`, `/clients`, `/agenda`, `/visits`, `/negotiations`, `/financial`, `/offers`, `/reports`, `/documents`, `/professional`, `/ai`, `/plans`, `/solicitacoes`, `/notificacoes`, `/help`, `/profile`, `/settings`, `/team`, `/integrations`, `/onboarding`.

---

## 19. Rotas do cliente

`/cliente/[slug]/*` — ver inventário seção 14.

---

## 20. Rotas públicas do corretor

`/corretor/[slug]`, `/imoveis`, `/imovel/[propertySlug]`, `/sobre`, `/contato`, `/campanha`, `/avaliacao`.

---

## 21. Rotas dos imóveis

| Contexto | Rota |
|----------|------|
| Painel | `/properties`, `/properties/create`, `/properties/[id]`, `/properties/[id]/edit` |
| Admin | `/admin/properties` |
| Público | `/corretor/[slug]/imovel/[propertySlug]` |

---

## 22. Componentes reutilizáveis

**Design System (`components/design-system/`)**

- Botões: `Button` (primary, secondary, tertiary, danger, outline)  
- Forms: Input, Textarea, Select, Checkbox, Radio, Toggle  
- Feedback: Alert, Badge, EmptyState, Skeleton, Progress, Modal  
- Cards: MetricCard, PropertyCard, AgentCard  
- Navigation: Tabs, Pagination, Breadcrumbs (DS)  
- Tables: Table  

**Layout:** `Sidebar`, `Header`, `Breadcrumbs` (app)  

**Por domínio:** `components/billing/*`, `components/ai-agent/*`, `components/professional/*`, `components/support/*`, `components/analytics/*`, `components/marketing/*`

---

## 23. Design tokens

Definidos em `app/globals.css` (OKLCH):

- **Primary:** tom terroso/quente (`--primary`) — identidade aprovada  
- Secondary, accent, muted, destructive, success, warning, info  
- Status imóveis: available, sold, rented, pending  
- Sidebar tokens  
- Radius escalonado (`--radius-*`)  
- Chart colors  

**Regra visual:** não trocar identidade sem autorização. Evitar temas “IA genéricos” (roxo default, cream+terracotta clichê, etc.) fora do DS.

---

## 24–28. Formulários, campos, validações, máscaras, estados

### Formulários principais (protótipo)

Login, signup, forgot-password, criação/edição de imóvel, onboarding corretor, checkout planos/IA/página profissional (simulados), chamado de suporte, solicitação, contato landing, comunicação admin, configuração IA, preferências cliente, etc.

### Campos recorrentes

Nome, e-mail, telefone, senha, CPF/CNPJ (quando aplicável), endereço, preço (R$), área, quartos/banheiros, status, prioridade, categoria, anexos simulados, cupom, plano.

### Validações (estado atual)

- Majoritariamente HTML `required` + checks client-side simples.  
- **`[NÃO DEFINIDO]`** schema Zod/Yup no servidor, unicidade de e-mail, força de senha, validação documental.

### Máscaras

- **`[NÃO DEFINIDO]`** máscaras formais de telefone/CPF/CNPJ/CEP (hoje formatação pontual em mocks).  
- Moeda: `formatCurrency` (pt-BR, BRL).  
- Datas: `formatDateBR` / `toLocaleString('pt-BR')`.

### Estados de UI obrigatórios (padrão do produto)

`loading` · `empty` · `error` · `success` · confirmações (modais) — já usados em billing/support/analytics e a expandir em telas legadas.

---

## 29. Fluxos de navegação (principais)

1. **Aquisição:** Landing → Signup/Login → Onboarding → Dashboard.  
2. **Imóvel:** Lista → Criar/Editar → Publicar → Página pública.  
3. **Lead/CRM:** Cliente/lead → Agenda/Visita → Proposta → Negociação → Checklist/Docs/Contrato/Assinatura → Conclusão → Comissão.  
4. **Página profissional:** Benefícios → Solicitar → Checkout (R$ 497) → Produção → Aprovação/Ajustes → Publicada.  
5. **IA:** Benefícios → Solicitar → Checkout (R$ 97) → Configuração → Conversas (assumir/devolver) → Métricas.  
6. **Planos:** Comparar → Checkout (provisório) → Plano atual/Faturas.  
7. **Suporte:** Ajuda/FAQ → Abrir chamado → Conversa → Resolução → Avaliação/Reabertura.  
8. **Cliente:** Cadastro no slug do corretor → Termos → Onboarding → Portal.

---

## 30. Ações (catálogo resumido)

CRUD imóveis/clientes; agendar/reagendar; confirmar visita; enviar proposta; avançar status de negociação; registrar comissão; contratar add-ons; pausar IA; abrir/responder chamado; alterar status (admin); marcar notificação lida; exportar/imprimir visual de relatórios (simulado).

---

## 31. Modais

Padrão: `Modal` do DS + diálogos de confirmação em billing/support/AI (`ConfirmDialog` / `ConfirmModal`).  
Usos: cancelar assinatura, pausar IA, reabrir chamado, confirmações destrutivas.

---

## 32. Notificações

**Tipos:** novos_leads, mensagens, visitas, propostas, contratos, pagamentos, assinatura, pagina_profissional, ia, suporte, avisos_sistema, atualizacoes, manutencao.

**UI:** sino no `Header` + `/notificacoes`.  
**Regra técnica atual:** sem push/e-mail reais.  
**Escopo:** por `realtorId` ou broadcast (`realtorId: null`) para sistema.

---

## 33. Eventos (sugeridos para backend)

`user.registered`, `property.published`, `lead.created`, `visit.scheduled`, `proposal.sent`, `negotiation.status_changed`, `commission.paid`, `subscription.renewed`, `subscription.delinquent`, `professional.published`, `ai.paused`, `ai.human_takeover`, `ticket.created`, `ticket.resolved`, `notification.created`, `audit.recorded`.

Implementação: `[NÃO DEFINIDO]` (fila, webhooks, outbox).

---

## 34–35. Entidades e relacionamentos

```
Tenant/Organization? [NÃO DEFINIDO] ──< Realtor (corretor)
Realtor ──< UserAccount (corretor, assistente…)
Realtor ──< Property ──< Media / Tour360 / Video
Realtor ──< Lead/Client ── Property (interesses)
Client ── Realtor (vínculo obrigatório)
Realtor ──< Appointment / Visit
Realtor ──< Negotiation ── Property, Client
Negotiation ──< Commission / Documents
Realtor ── Subscription ── Plan
Realtor ──< Invoice / Payment
Realtor ── ProfessionalPageRequest
Realtor ── AiIntegration ──< Conversation ──< Message
Realtor ──< SupportTicket ──< Message / InternalNote
Realtor ──< ServiceRequest
Realtor ──< Notification
Realtor ── PublicProfile (slug)
```

**Chave de isolamento:** `realtor_id` (UUID/int) em quase todas as tabelas operacionais.

---

## 36. Banco de dados sugerido

**Sugestão técnica (não prescrita como decisão final):** PostgreSQL + RLS por `realtor_id`, ou schema multi-tenant com `tenant_id` = corretor/imobiliária.

**`[NÃO DEFINIDO]`:** Postgres vs. outra store; multi-imobiliária (franquia) vs. corretor = tenant.

Índices sugeridos: `(realtor_id, created_at)`, `(slug)`, `(status)`, FKs com `ON DELETE` explícito.

---

## 37. Status de cada entidade

### Assinatura
`trial` · `ativa` · `pendente` · `inadimplente` · `cancelada` · `suspensa`

### Pagamento / fatura
`aprovado` · `pendente` · `vencido` · `falhou` · `reembolsado`

### Página profissional
`nao_contratado` · `solicitacao_iniciada` · `aguardando_informacoes` · `aguardando_materiais` · `aguardando_pagamento` · `pagamento_confirmado` · `em_producao` · `em_revisao_interna` · `aguardando_aprovacao_corretor` · `ajustes_solicitados` · `aprovado` · `publicado` · `suspenso` · `cancelado`

### IA
`nao_contratado` · `aguardando_pagamento` · `pagamento_confirmado` · `aguardando_informacoes` · `em_configuracao` · `aguardando_conexao` · `em_testes` · `ativo` · `pausado` · `com_falha` · `suspenso` · `cancelado`

### Conversa IA
`ia` · `humano` · `aguardando` · `encerrada`

### Chamado suporte
`novo` · `em_analise` · `em_atendimento` · `aguardando_corretor` · `aguardando_equipe` · `resolvido` · `encerrado` · `reaberto`  
Prioridade: `baixa` · `media` · `alta` · `urgente`

### Solicitação
`nova` · `em_analise` · `em_andamento` · `aguardando_corretor` · `concluida` · `recusada` · `cancelada`

### Agenda
`agendado` · `confirmado` · `reagendado` · `concluido` · `cancelado`

### Visita
`aguardando_confirmacao` · `confirmada` · `reagendada` · `realizada` · `cliente_nao_compareceu` · `corretor_nao_compareceu` · `cancelada`

### Negociação (trecho)
`proposta_em_preparacao` · `proposta_enviada` · `aguardando_proprietario` · `contraproposta` · `em_negociacao` · `documentacao` · … (ver `phase7-data.ts` completo)

### Comissão
`calculada` · `aguardando_fechamento` · `aprovada` · `aguardando_pagamento` · `parcialmente_paga` · `paga` · `cancelada`

### Imóvel (painel mock)
`draft` · `under_review` · `approved` · `published` · `reserved` · `sold` · `rented` (+ status públicos available/sold/rented/pending/reserved/unavailable)

---

## 38. Regras de negócio (consolidadas)

1. Isolamento estrito por corretor.  
2. Cliente vinculado a um corretor.  
3. Sem concorrência interna de anúncios.  
4. Semelhantes = mesma carteira.  
5. IA individual e transferível ao humano.  
6. Observações internas de suporte invisíveis ao corretor.  
7. Preços mensais de planos **provisórios**.  
8. Página profissional **R$ 497**.  
9. IA **R$ 97 sugerido**.  
10. Fluxos de pagamento/checkout são **simulações** no protótipo.  
11. Super Admin global; suporte limitado.  
12. Relatórios do corretor = só a carteira; admin = plataforma.

---

## 39–41. Assinaturas, planos, pagamentos

### Planos (provisórios)

| Plano | Preço/mês (provisório) | Imóveis | Usuários | Destaques |
|-------|------------------------|---------|----------|-----------|
| Essencial | R$ 69,90 | 30 | 1 | CRM básico, área cliente, Meu Site, PWA |
| Profissional | R$ 149,90 | 150 | 3 | Financeiro, negociações, IA add-on |
| Premium | R$ 299,90 | 500 | 10 | Equipe, domínio, IA ativação inclusa |

> **Nota (ago/2026):** planos renomeados — **Essencial** (ex-Inicial). Anuais: R$ 699 / R$ 1.499 / R$ 2.999. Preços **provisórios**.

### Add-ons
- Página profissional R$ 497 (único)  
- IA ativação R$ 97 (sugerido; Premium: ativação inclusa)  
- IA mensalidade R$ 97 (Pro) / R$ 79 (Premium) — provisório  
- Usuário extra R$ 29,90/mês · Domínio (Pro) R$ 19,90/mês  
- Outros (domínio, usuário, personalizado): valores de referência no fluxo de solicitações — **não finais**

### Pagamentos
Protótipo: estados de pagamento + checkout visual.  
**Produção `[NÃO DEFINIDO]`:** gateway (Stripe, Pagar.me, Asaas, etc.), PIX/boleto/cartão, split, NF-e, chargeback.

---

## 42. Página profissional

Preço fixo de referência **R$ 497**. Fluxo completo corretor + admin (`/professional/*`, `/admin/professional/*`). Status na seção 37.

---

## 43. IA e WhatsApp

Preço inicial sugerido **R$ 97**. Isolamento por corretor. Conversas, pausa, takeover humano, métricas/consumo (mock).  
**Produção `[NÃO DEFINIDO]`:** provedor WhatsApp (Meta Cloud API / BSP), provedor LLM, política de retenção, opt-in LGPD, custos de token.

---

## 44. CRM / Clientes

Lista de clientes/leads com estágio e origem; isolamento; área do cliente. Funil detalhado de estágios CRM: ampliar a partir de mocks — **`[NÃO DEFINIDO]`** taxonomia final de pipeline.

---

## 45. Imóveis

CRUD painel; publicação; mídia (upload real `[NÃO DEFINIDO]`); tour 360 e vídeo (conceitual/simulado); página pública; semelhantes do mesmo corretor.

---

## 46. Clientes (área)

Ver seção 8 e 12. Consentimento financeiro e termos no onboarding.

---

## 47. Agenda

Tipos: visita, tarefa, ligação, reunião, follow-up, pessoal, lembrete. Status na seção 37. Visão admin “global” no menu.

---

## 48. Negociações

Pipeline com documentos, contrato, assinatura, checklist, conclusão. Ligação com comissões.

---

## 49. Financeiro

Comissões, receitas, despesas, lançamentos, serviços, relatórios financeiros do corretor; financeiro plataforma no admin.

---

## 50. Suporte

Central de ajuda, FAQ, chamados (categorias/prioridades/status), anexos simulados, timeline, avaliação, reabertura; admin com SLA visual e notas internas.

---

## 51. Relatórios

Corretor: imóveis, engajamento, leads/origem/conversão, visitas, propostas, vendas/locações, comissões/receita, campanhas, páginas, IA/WhatsApp — com período, comparação, metas, insights simulados, export/print visual.  
Admin: receita/MRR, assinaturas, planos, trials, up/down, inadimplência, cancelamentos, crescimento, corretores, add-ons, consumo IA, chamados, imóveis/clientes/leads.

---

## 52. Integrações necessárias (produção)

| Integração | Finalidade | Status |
|------------|------------|--------|
| Gateway de pagamento | Assinaturas e add-ons | `[NÃO DEFINIDO]` |
| WhatsApp Business API | IA + atendimento | `[NÃO DEFINIDO]` |
| Provedor de IA/LLM | Agente | `[NÃO DEFINIDO]` |
| E-mail transacional | Auth, faturas, avisos | `[NÃO DEFINIDO]` |
| Storage de mídia | Fotos, vídeos, 360, anexos | `[NÃO DEFINIDO]` |
| Maps/geocoding | Endereços | `[NÃO DEFINIDO]` |
| Assinatura eletrônica | Contratos | `[NÃO DEFINIDO]` |
| Analytics produto | Funis | `[NÃO DEFINIDO]` |
| DNS/domínios | Página profissional | `[NÃO DEFINIDO]` |

---

## 53. APIs necessárias (esqueleto)

Autenticação · Usuários/Roles · Corretores · Imóveis · Mídias · Leads/Clientes · Agenda/Visitas · Negociações/Docs · Financeiro · Planos/Assinaturas/Webhooks pagamento · Professional · AI/Conversas/Webhooks WA · Tickets/Solicitações · Notificações · Relatórios · Admin/Audit · Portal Cliente.

Padrão sugerido: REST ou tRPC; versionamento `/v1`; autenticação Bearer/JWT + refresh; webhooks assinados.

---

## 54. Armazenamento de arquivos

**Protótipo:** anexos nominais simulados.  
**Produção sugerida:** object storage (S3-compatible) com prefixo `realtor_id/`, URLs assinadas, antivírus, limites de tipo/tamanho, CDN.  
Tour 360 / vídeo: storage + processamento assíncrono — `[NÃO DEFINIDO]`.

---

## 55. Autenticação

**Atual:** `localStorage` + heurística de e-mail.  
**Produção sugerida:** Auth.js/Clerk/Cognito/Supabase Auth — `[NÃO DEFINIDO]`; MFA opcional; sessões separadas corretor vs cliente; magic link cliente; recuperação de senha real.

---

## 56. Segurança (riscos)

| Risco | Mitigação |
|-------|-----------|
| Tenant leakage | RLS + testes de autorização |
| IDOR em `/properties/[id]` | Checar `realtor_id` server-side |
| Escalação de papel | Roles no token/servidor, não só e-mail |
| XSS em mensagens IA/chat | Sanitização |
| Upload malicioso | Validação MIME, scan, quarantena |
| Webhook WhatsApp forjado | Assinatura HMAC |
| Vazamento de notas internas | Endpoint separado, role gate |
| Secrets em front | Nunca expor chaves de pagamento/LLM |

---

## 57. Auditoria

Tela admin `/admin/audit` (mock). Em produção: log imutável de ações sensíveis (login, mudança de plano, acesso a dados pessoais, exportações, takeover IA).

---

## 58. LGPD

**Requisitos:**

- base legal e termos no cadastro cliente/corretor;  
- consentimento específico para dados financeiros do cliente;  
- DPA com subprocessadores (pagamento, WA, IA, storage);  
- direitos do titular (acesso, correção, exclusão, portabilidade);  
- retenção e exclusão por corretor/cliente;  
- minimização no treino de IA (não usar dados de outros tenants);  
- registro de consentimentos e opt-in WhatsApp.

**`[NÃO DEFINIDO]`:** DPO, prazos de retenção finais, política de cookies da landing.

---

## 59. Logs

Aplicação (estruturado JSON), acesso API, webhooks, erros (Sentry `[NÃO DEFINIDO]`), auditoria de segurança. Sem PII desnecessária em logs.

---

## 60. Backups

DB: snapshots diários + PITR. Storage: versionamento. Testes de restore periódicos. `[NÃO DEFINIDO]` RPO/RTO.

---

## 61. Variáveis de ambiente (sugeridas)

```
DATABASE_URL=
REDIS_URL=
AUTH_SECRET=
NEXTAUTH_URL=
PAYMENT_PROVIDER_KEY=
PAYMENT_WEBHOOK_SECRET=
WHATSAPP_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
LLM_API_KEY=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
EMAIL_PROVIDER_KEY=
SENTRY_DSN=
APP_URL=
```

Nenhuma dessas está obrigatória no protótipo atual (front-only).

---

## 62. Pontos ainda não definidos `[NÃO DEFINIDO]`

1. Preços finais dos planos mensais.  
2. Mensalidade definitiva da IA e packing de consumo.  
3. Gateway de pagamento e modelo fiscal (NF).  
4. Provedor WhatsApp e LLM.  
5. Modelo de tenant (corretor solo vs. imobiliária com vários corretores e permissões).  
6. Papéis/assistentes com ACL fina.  
7. Portal do proprietário.  
8. Domínio custom (DNS) ponta a ponta.  
9. Política de trial (duração, cartão obrigatório).  
10. Máscaras/validações oficiais CPF/CNPJ/CRECI.  
11. Pipeline CRM canônico (nomes de estágios).  
12. RPO/RTO, DPO, retenção LGPD.  
13. App mobile nativo vs. PWA.  
14. Internacionalização (hoje só pt-BR).  
15. White-label.

---

## 63. Decisões futuras (recomendações, não aprovadas)

- PostgreSQL + RLS como base de isolamento.  
- Billing com provedor BR (PIX + cartão).  
- Fila (BullMQ/SQS) para webhooks WA e jobs de mídia.  
- Feature flags por plano.  
- OpenAPI gerada a partir do contrato.  
- Ambiente staging espelhando produção com dados sintéticos.

---

## 64. Ordem recomendada de desenvolvimento

### Já entregue no protótipo (fases 1–19)
Design System, auth mock, painel corretor, agenda/visitas/negociações, financeiro, páginas públicas, área do cliente, página profissional (R$ 497), IA WhatsApp (R$ 97), planos/assinaturas simulados, landing, suporte/solicitações/notificações, relatórios, revisão/isolamento, documentação de handoff.

### Próxima ordem (produção — ver também `docs/ROADMAP.md`)
1. **Fundação:** auth real, tenants/`realtor_id`, RLS, Design System intacto.  
2. **Core corretor:** imóveis + mídias + clientes/leads.  
3. **Agenda/visitas/negociações** + documentos.  
4. **Financeiro do corretor** (comissões).  
5. **Página pública** corretor/imóvel (SEO, slugs).  
6. **Área do cliente** (auth + vínculo).  
7. **Planos/assinaturas/pagamentos** (com preços provisórios configuráveis).  
8. **Página profissional** (pedido interno + R$ 497).  
9. **IA + WhatsApp** (sandbox → produção; R$ 97 sugerido).  
10. **Suporte/solicitações/notificações**.  
11. **Relatórios** (materialized views / warehouse leve).  
12. **Admin** completo (auditoria, comunicação, métricas).  
13. **Hardening:** LGPD, backups, observabilidade, testes de isolamento.

---

## Arquitetura técnica sugerida (SaaS)

```
[Web Next.js] ── [API Gateway / BFF]
        │              │
        │         [Auth Service]
        │              │
        ├──────── [Domain Services]
        │   Imóveis · CRM · Agenda · Negociações
        │   Billing · Professional · AI Orchestrator
        │   Support · Notifications · Reports
        │              │
        ├──── PostgreSQL (RLS por realtor_id)
        ├──── Redis (cache/filas/sessão)
        ├──── Object Storage (mídias/anexos/360/vídeo)
        ├──── Payment Provider (webhooks)
        ├──── WhatsApp BSP (webhooks)
        ├──── LLM Provider
        └──── E-mail / Push
```

**Requisitos cobertos:** multiusuário, isolamento, Super Admin, crescimento horizontal de serviços, integrações, pagamentos, WhatsApp, IA, mídias/vídeo/360, notificações, relatórios.

---

## Credenciais e demos úteis (protótipo)

| Papel | Como entrar |
|-------|-------------|
| Super Admin | e-mail com `admin` + qualquer senha |
| Suporte | e-mail com `suporte` + qualquer senha |
| Corretor | e-mail de `realtorsList` (ex. `carlos.silva@corretor.hub`) quando possível |
| Cliente | fluxo `/cliente/[slug]` (ex. Marina) conforme phase11 |

---

## Checklist de handoff para o Cursor

- [ ] Ler este documento antes de criar APIs.  
- [ ] Preservar rotas e copy aprovados.  
- [ ] Preservar R$ 497 e R$ 97 sugerido.  
- [ ] Marcar planos mensais como configuráveis/provisórios até decisão comercial.  
- [ ] Implementar isolamento server-side com testes automatizados de tenant.  
- [ ] Não expor notas internas de suporte ao corretor.  
- [ ] Não treinar/compartilhar contexto de IA entre corretores.  
- [ ] Manter Design System (`components/design-system` + tokens CSS).  
- [ ] Qualquer preço/regra nova: registrar como `[NÃO DEFINIDO]` até aprovação.

---

*Documento gerado a partir do protótipo ImóvelHub (fases 1–18). Não altera telas nem fluxos aprovados.*
