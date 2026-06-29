-- Add name and avatar_url columns to the admins table
-- Enables admin profile personalization (display name, avatar photo)

ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';
