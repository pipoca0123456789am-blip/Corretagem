# Segurança — ImóvelHub

## Status atual (Fase 2 — CRITICAL 0 / HIGH 0 via fail-closed)

Branch: `security/production-hardening`.

**Todos os Critical e High conhecidos da auditoria foram corrigidos.**

O deploy só sobe em produção com `AUTH_SECRET` forte, `ENCRYPTION_KEY`, Postgres (`IMOVELHUB_DATABASE_URL`/`DATABASE_URL`) e Redis (`UPSTASH_*`/`REDIS_URL`). Sem isso, boot/auth falham fechados (não há fallback file/memory em prod).

## Implementado

| Área | Detalhe |
|------|---------|
| Sessões | JWT HS256 HttpOnly + linha `ih_sessions` (create/validate/rotate/revoke/revokeAll) |
| Legado | Cookies JSON forjáveis limpos; localStorage **não** é SoT de auth |
| Senhas | bcrypt 12; política min 10 |
| OTP | SHA-256, TTL 10 min, single-use; e-mail real ou pending_verification |
| Open redirect | `safeInternalPath` |
| Rate limit | Redis obrigatório em prod; memória só em dev/test |
| CSRF | `assertSameOrigin` (Origin/Host + Sec-Fetch-Site) |
| Reset senha | Token hashed + e-mail |
| RBAC / tenant | `lib/server/policies` — revalida role/status no store; tenant só da sessão |
| IDOR | Repositórios filtrados; override `broker_id` ignorado; testes A vs B |
| Portal cliente | `ih_client_sid` + middleware `/cliente/[slug]/*` + vínculo slug server-side |
| Store users | **Prod: Postgres only**; Dev: file/memory com logs |
| Revogação | **Prod: Redis only**; Dev: memória |
| E-mail | Resend quando env; prod sem provedor → **não finge envio** |
| 2FA TOTP | `ENCRYPTION_KEY`; prod exige 2FA admin **sem sessão completa** antes do TOTP |
| Seeds | Hard-refuse em produção (`ENABLE_DEV_SEED` ignorado) |
| Env | `lib/server/env.ts` + `instrumentation.ts` fail-closed |
| Logs | `ih_security_events` + `ih_audit_logs` append-only (Postgres ou arquivo) |
| Migrations | `20260820120000_*`, `20260820153000_*`, `20260820180000_sessions_security_audit.sql` |
| Testes | JWT, CSRF, IDOR, fail-closed, seed, email, 2FA, serializers |
| CI | `.github/workflows/ci.yml` |

## `ignoreBuildErrors`

Removido. Build falha em erros TS reais. Gate: `pnpm typecheck:security`.

## Residual MEDIUM / LOW (mitigados)

| Severidade | Item | Mitigação |
|------------|------|-----------|
| MEDIUM | Prefs portal (favoritos) em localStorage | Não são credenciais; auth é cookie |
| MEDIUM | CSRF double-submit token | SameSite=Lax + Origin/Host nas mutações |
| MEDIUM | Pentest externo | Checklist em `docs/PENTEST-CHECKLIST.md` |
| LOW | SMTP nativo | Preferir Resend; SMTP retorna erro explícito |
| LOW | Edge middleware sem DB row check | Guards Node revalidam user + sessão DB |

## Variáveis (produção)

Ver `.env.example`. Obrigatórias: `AUTH_SECRET`, `ENCRYPTION_KEY`, `IMOVELHUB_DATABASE_URL` ou `DATABASE_URL`, Redis Upstash ou `REDIS_URL`, `RESEND_API_KEY` (para entrega real de e-mail).

## Relatório de auditoria (§39)

| Severidade | Status |
|------------|--------|
| CRITICAL | **0** — corrigidos |
| HIGH | **0** — corrigidos em código + fail-closed |
| MEDIUM | Residual mitigado (ver tabela acima) |
| LOW | Residual aceito / documentado |

### Controles por domínio

| Domínio | Status |
|---------|--------|
| DATABASE | Adapter Postgres wired; migrations versionadas; prod exige URL |
| REDIS | Obrigatório em prod para rate-limit + revogação |
| EMAIL | Resend; sem provedor não finge envio |
| CLIENT AUTH | Cookie `ih_client_sid`; localStorage não é SoT |
| TENANT | `session.realtorId` / DB; body/query ignorados |
| IDOR | Repos + testes Broker A vs B → 404 |
| 2FA | ENCRYPTION_KEY; sem sessão completa antes do TOTP em prod |
| RATE LIMIT | Redis em prod |
| AUDIT | Append-only security_events + audit_logs |
| TYPECHECK | `typecheck` + `typecheck:security` |
| TEST | Suites security verdes |
| BUILD | Sem `ignoreBuildErrors` |

## `pnpm audit` (report — sem major upgrades forçados)

Executado na Fase 2: vulnerabilidades em deps transitivas (`shadcn` CLI, etc.) e patch de **Next.js** aplicado `16.2.6 → 16.2.11` (GHSA middleware bypass). Demais highs de tooling (`brace-expansion` via shadcn, `sharp` via next) documentados; não forçar majors. Reavaliar periodicamente.

## Docs

- `docs/THREAT-MODEL.md`
- `docs/PENTEST-CHECKLIST.md`

## Smoke (dev)

1. `ENABLE_DEV_SEED=true` → login admin/corretor/cliente
2. Admin → login → challenge 2FA setup (prod) ou `/admin/security/2fa`
3. `GET /api/properties` autenticado → só tenant da sessão
4. Sem secrets em prod: instrumentation/auth falham fechados
5. `pnpm test` + `pnpm typecheck:security` + `pnpm build`
