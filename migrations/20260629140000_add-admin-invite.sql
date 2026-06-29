-- Add invite_token, invite_token_expires_at, and password_set columns

ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS invite_token TEXT,
  ADD COLUMN IF NOT EXISTS invite_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_set BOOLEAN NOT NULL DEFAULT false;

-- Allow password_hash to be nullable for invited (not-yet-registered) admins
ALTER TABLE public.admins
  ALTER COLUMN password_hash DROP NOT NULL;

-- Backfill password_set for existing admins that already have a password_hash
UPDATE public.admins SET password_set = true WHERE password_hash IS NOT NULL;
