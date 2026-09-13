-- ImóvelHub: sessões server-side, security_events, audit_logs, vínculos cliente
-- Aplicar SOMENTE no schema ImóvelHub (não no projeto MCP de outro produto).
-- Append-only para security_events e audit_logs (sem UPDATE/DELETE de aplicação).

-- Sessões opacas / JWT sid ↔ linha DB (revoke/rotate/list)
CREATE TABLE IF NOT EXISTS public.ih_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.ih_users (id) ON DELETE CASCADE,
  realm TEXT NOT NULL CHECK (realm IN ('admin', 'app', 'client')),
  role TEXT NOT NULL,
  realtor_id BIGINT NULL,
  user_agent TEXT NULL,
  ip TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  rotated_from TEXT NULL REFERENCES public.ih_sessions (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ih_sessions_user_idx ON public.ih_sessions (user_id);
CREATE INDEX IF NOT EXISTS ih_sessions_active_idx
  ON public.ih_sessions (user_id, realm)
  WHERE revoked_at IS NULL;

-- Eventos de segurança (append-only)
CREATE TABLE IF NOT EXISTS public.ih_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id TEXT NULL,
  email TEXT NULL,
  realm TEXT NULL,
  ip TEXT NULL,
  user_agent TEXT NULL,
  detail TEXT NULL,
  result TEXT NOT NULL CHECK (result IN ('ok', 'denied', 'error')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS ih_security_events_at_idx ON public.ih_security_events (at DESC);
CREATE INDEX IF NOT EXISTS ih_security_events_type_idx ON public.ih_security_events (type);
CREATE INDEX IF NOT EXISTS ih_security_events_user_idx ON public.ih_security_events (user_id);

-- Audit logs de domínio (append-only)
CREATE TABLE IF NOT EXISTS public.ih_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_user_id TEXT NULL,
  actor_role TEXT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NULL,
  tenant_realtor_id BIGINT NULL,
  ip TEXT NULL,
  detail TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS ih_audit_logs_at_idx ON public.ih_audit_logs (at DESC);
CREATE INDEX IF NOT EXISTS ih_audit_logs_actor_idx ON public.ih_audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS ih_audit_logs_resource_idx
  ON public.ih_audit_logs (resource_type, resource_id);

-- Vínculo cliente ↔ corretor (slug resolvido no servidor; nunca confiar broker_id do body)
CREATE TABLE IF NOT EXISTS public.ih_client_broker_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id TEXT NOT NULL REFERENCES public.ih_users (id) ON DELETE CASCADE,
  tenant_realtor_id BIGINT NOT NULL,
  broker_id BIGINT NOT NULL,
  referral_slug TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'portal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_user_id, tenant_realtor_id)
);

CREATE INDEX IF NOT EXISTS ih_client_broker_links_slug_idx
  ON public.ih_client_broker_links (lower(referral_slug));

-- Alias conceitual: email_verifications ≡ ih_email_otps (já existente)
-- Alias conceitual: two_factor_secrets / recovery_codes ≡ colunas em ih_users
-- Alias conceitual: password_reset_tokens ≡ ih_password_reset_tokens
-- Alias conceitual: credentials ≡ password_hash em ih_users

COMMENT ON TABLE public.ih_sessions IS 'Server sessions — JWT sid must match active row when DB wired';
COMMENT ON TABLE public.ih_security_events IS 'Append-only security events; no update API';
COMMENT ON TABLE public.ih_audit_logs IS 'Append-only audit trail; no update API';
COMMENT ON TABLE public.ih_client_broker_links IS 'Client portal broker linkage from server-resolved slug';
