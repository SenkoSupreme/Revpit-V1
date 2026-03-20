-- Migration 008: Admin action log

-- ── admin_logs table ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Who did it
  actor_id       text        NOT NULL,          -- Clerk userId
  actor_username text        NOT NULL DEFAULT 'unknown',
  actor_email    text,
  actor_role     text        NOT NULL DEFAULT 'unknown',

  -- What they did
  action         text        NOT NULL,          -- e.g. APPROVE_LISTING, DELETE_DROP, SET_ROLE

  -- What it was done to
  target_type    text,                          -- 'listing' | 'drop' | 'reply' | 'user'
  target_id      text,
  target_label   text,                          -- human-readable: listing title, @username, etc.

  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by actor and time
CREATE INDEX IF NOT EXISTS admin_logs_actor_idx
  ON public.admin_logs (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_logs_created_idx
  ON public.admin_logs (created_at DESC);

-- ── RLS: read-only for service role, no direct client access ─────────────────

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_logs_all" ON public.admin_logs;
CREATE POLICY "admin_logs_all"
  ON public.admin_logs FOR ALL
  USING (true)
  WITH CHECK (true);
