-- ImóvelHub auth foundations (aplicar quando DATABASE_URL / Supabase estiver ligado)
-- Não executa automaticamente neste repo demo — ver SECURITY.md

CREATE TABLE IF NOT EXISTS public.ih_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (
    role IN (
      'super_admin',
      'admin',
      'suporte',
      'financeiro',
      'corretor',
      'assistente',
      'cliente'
    )
  ),
  status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo', 'pending_verification')),
  realtor_id BIGINT NULL,
  email_verified_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ih_users_email_lower_idx ON public.ih_users (lower(email));
CREATE INDEX IF NOT EXISTS ih_users_realtor_id_idx ON public.ih_users (realtor_id);

-- Revogação: uma linha por SID; revoked_before no user via coluna auxiliar
CREATE TABLE IF NOT EXISTS public.ih_session_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.ih_users (id) ON DELETE CASCADE,
  sid TEXT NULL,
  revoked_before TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ih_session_revocations_sid_uidx
  ON public.ih_session_revocations (user_id, sid)
  WHERE sid IS NOT NULL;

CREATE INDEX IF NOT EXISTS ih_session_revocations_user_idx
  ON public.ih_session_revocations (user_id);

CREATE TABLE IF NOT EXISTS public.ih_password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.ih_users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ih_password_reset_email_idx ON public.ih_password_reset_tokens (lower(email));

CREATE TABLE IF NOT EXISTS public.ih_email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.ih_users (id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ih_users IS 'ImóvelHub auth users — wire via lib/server/store postgres adapter';
COMMENT ON TABLE public.ih_session_revocations IS 'Prefer Redis for hot path; table is durable fallback';
