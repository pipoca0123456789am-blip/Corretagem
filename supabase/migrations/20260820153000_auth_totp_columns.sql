-- ImóvelHub: colunas TOTP / 2FA em ih_users
-- Aplicar apenas no schema ImóvelHub (não no projeto MCP de outro produto)

ALTER TABLE public.ih_users
  ADD COLUMN IF NOT EXISTS totp_secret_enc TEXT NULL,
  ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS totp_recovery_hashes TEXT[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.ih_users.totp_secret_enc IS 'TOTP secret encrypted at rest (AES-GCM); never expose to client';
COMMENT ON COLUMN public.ih_users.totp_enabled IS 'Whether TOTP 2FA is enrolled and confirmed';
COMMENT ON COLUMN public.ih_users.totp_recovery_hashes IS 'SHA-256 hashes of one-time recovery codes';
