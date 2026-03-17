'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

export type OnboardingState = { error: string | null };

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const username         = (formData.get('username')         as string).trim();
  const bio              = (formData.get('bio')              as string).trim();
  const make             = (formData.get('make')             as string).trim();
  const model            = (formData.get('model')            as string).trim();
  const year             = parseInt(formData.get('year')     as string, 10);
  const mods             = (formData.get('mods')             as string).trim();
  const instagram_handle = (formData.get('instagram_handle') as string).trim();
  const social_followers = parseInt(formData.get('social_followers') as string, 10) || 0;

  // ── Validate ────────────────────────────────────────────────────────────

  if (!username || username.length < 3)
    return { error: 'Username must be at least 3 characters.' };
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return { error: 'Username can only contain letters, numbers, and underscores.' };
  if (!make || !model)
    return { error: 'Car make and model are required.' };
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1)
    return { error: 'Enter a valid car year.' };

  const supabase = createAdminClient();

  // ── Check username uniqueness ────────────────────────────────────────────

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) return { error: 'Username is already taken. Try another.' };

  // ── Insert profile and get back the UUID id ──────────────────────────────

  const profile_completion =
    20 +
    (bio              ? 10 : 0) +
    30 +
    (social_followers ? 10 : 0);

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      clerk_id:          userId,
      username,
      bio:               bio || null,
      instagram_handle:  instagram_handle || null,
      social_followers,
      quest_completions: 0,
      club_activity:     0,
      global_rank:       null,
      profile_completion,
    })
    .select('id')
    .single();

  if (profileError) return { error: profileError.message };

  // ── Insert car (user_id = profiles.id UUID; mods stored as plain text) ───

  const { error: carError } = await supabase.from('cars').insert({
    user_id: profileData.id,
    make,
    model,
    year,
    mods:    mods || null,   // text column — store as-is
  });

  if (carError) return { error: carError.message };

  redirect('/dashboard');
}
