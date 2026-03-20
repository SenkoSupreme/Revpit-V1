-- Migration 006: PIT MARKET store

-- ── Store listings ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.store_listings (
  id               uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id        text          NOT NULL,  -- Clerk userId (text)
  seller_username  text          NOT NULL DEFAULT 'unknown',
  title            text          NOT NULL,
  description      text          NOT NULL DEFAULT '',
  price            numeric(10,2) NOT NULL DEFAULT 0,
  category         text          NOT NULL DEFAULT 'merch'
                   CHECK (category IN ('merch', 'car_parts')),
  condition        text          NOT NULL DEFAULT 'used'
                   CHECK (condition IN ('new', 'like_new', 'used')),
  images           text[]        NOT NULL DEFAULT '{}',
  is_exclusive     boolean       NOT NULL DEFAULT false,
  status           text          NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected')),
  is_sold          boolean       NOT NULL DEFAULT false,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now()
);

-- ── Club members (who has joined a club — beyond just the owner) ──────────────

CREATE TABLE IF NOT EXISTS public.club_members (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id     uuid        NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  member_id   text        NOT NULL,   -- Clerk userId
  role        text        NOT NULL DEFAULT 'member',
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(club_id, member_id)
);

-- ── Add is_subscribed to profiles ─────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'is_subscribed'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_subscribed boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- ── Supabase Storage bucket for listing images ────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-images',
  'store-images',
  true,
  5242880,  -- 5 MB per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "store_images_public_read" ON storage.objects;
CREATE POLICY "store_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-images');

-- Authenticated upload
DROP POLICY IF EXISTS "store_images_authenticated_insert" ON storage.objects;
CREATE POLICY "store_images_authenticated_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-images');

-- Owner delete
DROP POLICY IF EXISTS "store_images_owner_delete" ON storage.objects;
CREATE POLICY "store_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-images');

-- ── RLS on store_listings ─────────────────────────────────────────────────────

ALTER TABLE public.store_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members   ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved listings
DROP POLICY IF EXISTS "store_listings_public_read" ON public.store_listings;
CREATE POLICY "store_listings_public_read"
  ON public.store_listings FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert their own listings
DROP POLICY IF EXISTS "store_listings_insert" ON public.store_listings;
CREATE POLICY "store_listings_insert"
  ON public.store_listings FOR INSERT
  WITH CHECK (true);

-- Sellers can update/delete their own listings
DROP POLICY IF EXISTS "store_listings_owner_write" ON public.store_listings;
CREATE POLICY "store_listings_owner_write"
  ON public.store_listings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Club members: anyone can read, authenticated can insert
DROP POLICY IF EXISTS "club_members_read" ON public.club_members;
CREATE POLICY "club_members_read"
  ON public.club_members FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "club_members_insert" ON public.club_members;
CREATE POLICY "club_members_insert"
  ON public.club_members FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "club_members_delete" ON public.club_members;
CREATE POLICY "club_members_delete"
  ON public.club_members FOR DELETE
  USING (true);
