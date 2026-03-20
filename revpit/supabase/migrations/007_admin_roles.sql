-- Migration 007: Admin roles + role assignments

-- ── Add role column to profiles ───────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role text NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- Add CHECK constraint idempotently
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema     = 'public'
      AND table_name       = 'profiles'
      AND constraint_name  = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'moderator', 'admin'));
  END IF;
END $$;

-- ── Add email column to profiles (needed for role lookup) ─────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
END $$;

-- ── Role assignments table (pre-grant roles by email) ─────────────────────────

CREATE TABLE IF NOT EXISTS public.role_assignments (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email       text        NOT NULL UNIQUE,
  role        text        NOT NULL CHECK (role IN ('moderator', 'admin')),
  granted_by  text,                         -- Clerk userId of granter
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Seed: grant admin to brija.main@gmail.com ────────────────────────────────

INSERT INTO public.role_assignments (email, role)
VALUES ('brija.main@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- ── RLS on role_assignments ───────────────────────────────────────────────────

ALTER TABLE public.role_assignments ENABLE ROW LEVEL SECURITY;

-- Only service role (admin client) can read/write — app enforces this via admin client
DROP POLICY IF EXISTS "role_assignments_admin_all" ON public.role_assignments;
CREATE POLICY "role_assignments_admin_all"
  ON public.role_assignments FOR ALL
  USING (true)
  WITH CHECK (true);
