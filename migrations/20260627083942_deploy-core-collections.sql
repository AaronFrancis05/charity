-- admins
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- children_profiles
CREATE TABLE public.children_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  region TEXT NOT NULL,
  narrative TEXT NOT NULL DEFAULT '',
  profile_image_url TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  goal_monthly_ugx INTEGER NOT NULL CHECK (goal_monthly_ugx > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES public.admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- donations_ledger
CREATE TABLE public.donations_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.children_profiles(id),
  provider TEXT NOT NULL CHECK (provider IN ('CARD', 'MTN_MOMO', 'AIRTEL_MONEY')),
  amount_usd NUMERIC(12,2),
  amount_ugx NUMERIC(12,2),
  donor_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'pending', 'settled', 'failed', 'refunded')),
  provider_reference TEXT,
  webhook_verified_at TIMESTAMPTZ,
  receipt_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- admin_audit_logs — append-only
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  target_id UUID,
  ip_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper: check if current auth user is an active admin
-- SECURITY DEFINER bypasses RLS on admins (which is service-role-only)
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins a
    WHERE a.email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())
      AND a.is_active = true
  );
$$;

CREATE INDEX idx_admins_email ON public.admins(email);
CREATE INDEX idx_children_profiles_is_active ON public.children_profiles(is_active);
CREATE INDEX idx_children_profiles_region ON public.children_profiles(region);
CREATE INDEX idx_children_profiles_created_by ON public.children_profiles(created_by);
CREATE INDEX idx_donations_ledger_child_id ON public.donations_ledger(child_id);
CREATE INDEX idx_donations_ledger_status ON public.donations_ledger(status);
CREATE INDEX idx_donations_ledger_provider ON public.donations_ledger(provider);
CREATE INDEX idx_donations_ledger_created_at ON public.donations_ledger(created_at);
CREATE INDEX idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_event_type ON public.admin_audit_logs(event_type);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);

CREATE TRIGGER children_profiles_updated_at
  BEFORE UPDATE ON public.children_profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TRIGGER donations_ledger_updated_at
  BEFORE UPDATE ON public.donations_ledger
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- children_profiles: anon can only read active children
CREATE POLICY "anon read active" ON public.children_profiles
  FOR SELECT TO anon
  USING (is_active = true);

-- children_profiles: authenticated (active admins) can read all children
CREATE POLICY "auth read all" ON public.children_profiles
  FOR SELECT TO authenticated
  USING (true);

-- children_profiles: only active admins may insert, update, delete
CREATE POLICY "auth insert" ON public.children_profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

CREATE POLICY "auth update" ON public.children_profiles
  FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

CREATE POLICY "auth delete" ON public.children_profiles
  FOR DELETE TO authenticated
  USING (public.is_active_admin());

-- admins, donations_ledger, admin_audit_logs are service-role-only
-- No policies needed — no grants given to anon or authenticated

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.children_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children_profiles TO authenticated;

-- audit log is append-only: revoke update and delete from authenticated
REVOKE UPDATE, DELETE ON public.admin_audit_logs FROM authenticated;
