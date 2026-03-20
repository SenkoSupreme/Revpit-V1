'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ListingState = { error: string | null; success?: boolean };

// ─── createListing ────────────────────────────────────────────────────────────
/**
 * Server action: inserts a new store listing (status = 'pending', awaits moderation).
 * Reads image URLs from formData key "images" (JSON array string).
 */
export async function createListing(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const { userId } = await auth();
  if (!userId) return { error: 'You must be signed in to list an item.' };

  const title        = (formData.get('title')       as string | null)?.trim();
  const description  = (formData.get('description') as string | null)?.trim() ?? '';
  const priceRaw     = formData.get('price') as string | null;
  const category     = formData.get('category') as string | null;
  const condition    = formData.get('condition') as string | null;
  const is_exclusive = formData.get('is_exclusive') === 'true';
  const imagesRaw    = formData.get('images') as string | null;

  if (!title)       return { error: 'Title is required.' };
  if (title.length > 80) return { error: 'Title must be 80 characters or fewer.' };

  const price = parseFloat(priceRaw ?? '');
  if (isNaN(price) || price < 0) return { error: 'Enter a valid price.' };
  if (price > 999999) return { error: 'Price is too high.' };

  if (!category || !['merch', 'car_parts'].includes(category))
    return { error: 'Select a valid category.' };

  if (!condition || !['new', 'like_new', 'used'].includes(condition))
    return { error: 'Select a valid condition.' };

  let images: string[] = [];
  try {
    images = imagesRaw ? JSON.parse(imagesRaw) : [];
    if (!Array.isArray(images)) images = [];
  } catch {
    images = [];
  }
  images = images.slice(0, 5); // max 5 images

  const supabase = createAdminClient();

  // Get seller username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('clerk_id', userId)
    .single();

  const { error } = await supabase.from('store_listings').insert({
    seller_id:       userId,
    seller_username: profile?.username ?? 'unknown',
    title,
    description,
    price,
    category,
    condition,
    images,
    is_exclusive,
    status:          'pending',
  });

  if (error) return { error: error.message };

  revalidatePath('/store');
  redirect('/store?submitted=1');
}

// ─── uploadListingImage ───────────────────────────────────────────────────────
/**
 * Server action: uploads a single image file to the store-images Supabase
 * Storage bucket. Returns the public URL on success.
 */
export async function uploadListingImage(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return { error: 'No file provided.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'File must be under 5 MB.' };

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) return { error: 'Unsupported file type.' };

  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createAdminClient();

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('store-images')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from('store-images').getPublicUrl(path);
  return { url: data.publicUrl };
}

// ─── markAsSold ───────────────────────────────────────────────────────────────
/**
 * Server action: marks a listing as sold. Only the seller can do this.
 */
export async function markAsSold(listingId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from('store_listings')
    .select('seller_id')
    .eq('id', listingId)
    .single();

  if (!listing) return { error: 'Listing not found.' };
  if (listing.seller_id !== userId) return { error: 'Not your listing.' };

  const { error } = await supabase
    .from('store_listings')
    .update({ is_sold: true, updated_at: new Date().toISOString() })
    .eq('id', listingId);

  if (error) return { error: error.message };

  revalidatePath('/store');
  revalidatePath(`/store/${listingId}`);
  return {};
}

// ─── deleteListing ────────────────────────────────────────────────────────────
/**
 * Server action: deletes a listing permanently. Only the seller can do this.
 */
export async function deleteListing(listingId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from('store_listings')
    .select('seller_id')
    .eq('id', listingId)
    .single();

  if (!listing) return { error: 'Listing not found.' };
  if (listing.seller_id !== userId) return { error: 'Not your listing.' };

  const { error } = await supabase
    .from('store_listings')
    .delete()
    .eq('id', listingId);

  if (error) return { error: error.message };

  revalidatePath('/store');
  redirect('/store');
}
