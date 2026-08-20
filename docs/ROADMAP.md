# ImóvelHub — Roadmap do protótipo

**Atualizado:** 28/07/2026  
**App local:** http://localhost:3000  

> **Valores preservados:** Página profissional **R$ 497** · IA **R$ 97** (sugerido) · planos mensais **provisórios**

---

## Acesso rápido (demo)

Senha: **qualquer valor** (login simulado).

| Papel | E-mail | Para onde vai |
|-------|--------|---------------|
| **Super Admin** | `admin@imovel.hub` | `/admin/dashboard` |
| **Suporte** | `ana.suporte@imovel.hub` | `/admin/support` |
| **Corretor** | `carlos.silva@corretor.hub` | `/dashboard` |

---

## Status das fases

| Fase | Tema | Status |
|------|------|--------|
| 1–6 | DS, auth, dashboard, imóveis, onboarding | Concluída |
| 7 | Agenda, visitas, negociações | Concluída |
| 8 | Financeiro do corretor | Concluída |
| 9–10 | Página pública corretor / imóvel | Concluída |
| 11 | Área do cliente | Concluída |
| 12 | Página profissional (R$ 497) | Concluída |
| 13 | IA + WhatsApp (R$ 97) | Concluída |
| 14 | Planos / assinaturas / pagamentos (simulados) | Concluída |
| 15 | Landing comercial | Concluída |
| 16 | Suporte, solicitações, notificações | Concluída |
| 17 | Relatórios e analytics | Concluída |
| 18 | Revisão, responsividade, isolamento | Concluída |
| 19 | Documentação e handoff Cursor | Concluída |
| **20+** | Backend real, pagamentos, WhatsApp/IA reais | **Próximo** (produção) |

---

## Próximos passos (produção)

Ordem recomendada (detalhe em `docs/HANDOFF-CURSOR.md`):

1. Auth real + tenant/`realtor_id` + RLS  
2. Imóveis + mídias + CRM  
3. Agenda / visitas / negociações  
4. Financeiro  
5. Páginas públicas + área do cliente  
6. Billing (planos provisórios configuráveis)  
7. Página profissional (R$ 497)  
8. IA + WhatsApp (R$ 97 sugerido)  
9. Suporte / notificações / relatórios  
10. Hardening LGPD, backups, auditoria  

Pontos `[NÃO DEFINIDO]`: preços finais dos planos mensais, gateway de pagamento, provedor WA/LLM, ACL de assistentes, portal do proprietário.

---

## Rotas Super Admin

Base: http://localhost:3000  

Login: `admin@imovel.hub` / qualquer senha  

| Módulo | Rota |
|--------|------|
| Dashboard | `/admin/dashboard` |
| Corretores | `/admin/realtors` |
| Usuários | `/admin/users` |
| Área do cliente | `/admin/client-portal` |
| Imóveis (global) | `/admin/properties` |
| Assinaturas / planos | `/admin/subscriptions` |
| Detalhe assinatura | `/admin/subscriptions/[id]` |
| Financeiro plataforma | `/admin/financial` |
| Solicitações | `/admin/requests` |
| Detalhe solicitação | `/admin/requests/[id]` |
| Página profissional | `/admin/professional` |
| Detalhe página profissional | `/admin/professional/[id]` |
| IA Agents | `/admin/ai` |
| Detalhe IA | `/admin/ai/[id]` |
| Suporte (fila) | `/admin/support` |
| Detalhe chamado | `/admin/support/[id]` |
| Comunicação | `/admin/communication` |
| Relatórios | `/admin/reports` |
| Auditoria | `/admin/audit` |
| Configurações | `/admin/settings` |

Também no menu admin (visão ampla): `/agenda`, `/visits`, `/negotiations`, `/financial`, `/notificacoes`.

---

## Rotas agente de suporte

Login: `ana.suporte@imovel.hub` / qualquer senha  

| Módulo | Rota |
|--------|------|
| Fila de suporte | `/admin/support` |
| Solicitações | `/admin/requests` |
| Relatórios | `/admin/reports` |
| Notificações | `/notificacoes` |

---

## Documentação

- Handoff completo: [`docs/HANDOFF-CURSOR.md`](./HANDOFF-CURSOR.md)  
- Índice: [`docs/README.md`](./README.md)
