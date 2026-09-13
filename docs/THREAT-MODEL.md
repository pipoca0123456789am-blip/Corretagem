# Threat Model — ImóvelHub

## Escopo

SaaS imobiliário multi-tenant (admin / corretor / cliente), Next.js na Vercel.

## Ativos

- Contas admin e dados da plataforma
- Carteiras de corretores (imóveis, CRM, financeiro)
- Dados de clientes (PII, documentos)
- Sessões autenticadas
- Secrets (`AUTH_SECRET`, futuros payment/WhatsApp keys)

## Atores

| Ator | Motivação |
|------|-----------|
| Visitante / bot | Spam, scrape, abuse |
| Cliente malicioso | Ver dados de outro cliente/corretor |
| Corretor malicioso | Acessar carteira alheia / admin |
| Atacante externo | Conta admin, ransomware de dados |
| Insider admin | Abuso de privilégio |

## Ameaças prioritárias

### T1 — Forja de sessão admin (CRITICAL — mitigado nesta fase)

- **Vetor:** Cookie JSON editável
- **Mitigação:** JWT assinado HttpOnly (`ih_admin_sid`); legado limpo
- **Residual:** Sem rotação de refresh / denylist de `sid` ainda

### T2 — Forja de sessão corretor (HIGH — mitigado)

- Idem T1 com `ih_app_sid`

### T3 — Credenciais em localStorage (HIGH — mitigado no fluxo novo)

- **Mitigação:** bcrypt server-side; cadastro via API
- **Residual:** código legado em `lib/auth.ts` ainda existe para compat; não usar em fluxos novos

### T4 — OTP simulado (HIGH — parcialmente mitigado)

- OTP real server-side; falta envio de e-mail em produção

### T5 — IDOR multi-tenant (HIGH — aberto)

- Dados ainda em localStorage por realtorId no cliente
- Requer APIs + filtro server-side

### T6 — XSS → roubo de sessão

- HttpOnly reduz impacto; CSP inicial; sanitização de HTML de usuário pendente

### T7 — Open redirect (MEDIUM — mitigado)

- Allowlist `safeInternalPath`

### T8 — Credential stuffing

- Rate limit básico; falta 2FA admin e lockout por conta

## Controles por camada

1. Edge/middleware: JWT verify
2. API: zod + rate limit + guards
3. Store: password hash, status
4. UI: banner demo, sem seeds em prod

## Aceite production-ready

CRITICAL=0 e HIGH=0 + pentest independente. Checklist: `docs/PENTEST-CHECKLIST.md`. Critérios de aceite: prompt mestre §77.
