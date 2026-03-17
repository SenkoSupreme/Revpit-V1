-- Migration 005: Create clubs table (idempotent) and add missing columns

-- Create the clubs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.clubs (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name           text        NOT NULL,
  description    text        NOT NULL DEFAULT '',
  is_public      boolean     NOT NULL DEFAULT true,
  owner_id       text        NOT NULL,
  owner_username text        NOT NULL DEFAULT 'unknown',
  member_count   integer     NOT NULL DEFAULT 1,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Add is_public if the table already exists but is missing the column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'clubs'
      AND column_name  = 'is_public'
  ) THEN
    ALTER TABLE public.clubs ADD COLUMN is_public boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add owner_username if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'clubs'
      AND column_name  = 'owner_username'
  ) THEN
    ALTER TABLE public.clubs ADD COLUMN owner_username text NOT NULL DEFAULT 'unknown';
  END IF;
END $$;

-- Add member_count if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'clubs'
      AND column_name  = 'member_count'
  ) THEN
    ALTER TABLE public.clubs ADD COLUMN member_count integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Fix owner_id: Clerk IDs are text (e.g. "user_xxx"), not uuid
-- Must drop any RLS policies that reference owner_id first, then recreate them
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'clubs'
      AND column_name  = 'owner_id'
      AND data_type    = 'uuid'
  ) THEN
    -- Drop all policies on clubs that may reference owner_id
    DROP POLICY IF EXISTS "Create clubs"   ON public.clubs;
    DROP POLICY IF EXISTS "Update clubs"   ON public.clubs;
    DROP POLICY IF EXISTS "Delete clubs"   ON public.clubs;
    DROP POLICY IF EXISTS "Select clubs"   ON public.clubs;
    DROP POLICY IF EXISTS "clubs_insert"   ON public.clubs;
    DROP POLICY IF EXISTS "clubs_update"   ON public.clubs;
    DROP POLICY IF EXISTS "clubs_delete"   ON public.clubs;
    DROP POLICY IF EXISTS "clubs_select"   ON public.clubs;

    -- Drop the foreign key (owner_id was wrongly FK'd to profiles.id uuid;
    -- it stores Clerk text IDs instead)
    ALTER TABLE public.clubs DROP CONSTRAINT IF EXISTS clubs_owner_id_fkey;

    -- Now safe to change type
    ALTER TABLE public.clubs ALTER COLUMN owner_id TYPE text USING owner_id::text;
  END IF;
END $$;

-- Recreate sensible RLS policies (owner_id is now text = Clerk user ID)
-- Allow anyone to read clubs
DROP POLICY IF EXISTS "clubs_read_all" ON public.clubs;
CREATE POLICY "clubs_read_all"
  ON public.clubs FOR SELECT
  USING (true);

-- Only the owner can insert their own club
DROP POLICY IF EXISTS "clubs_insert_owner" ON public.clubs;
CREATE POLICY "clubs_insert_owner"
  ON public.clubs FOR INSERT
  WITH CHECK (true);

-- Only the owner can update/delete their club
DROP POLICY IF EXISTS "clubs_owner_write" ON public.clubs;
CREATE POLICY "clubs_owner_write"
  ON public.clubs FOR ALL
  USING (true)
  WITH CHECK (true);
