'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export type SettingsState = { error: string | null; success: boolean };

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.', success: false };

  const bio              = (formData.get('bio')              as string).trim();
  const instagram_handle = (formData.get('instagram_handle') as string).trim();
  const social_followers = parseInt(formData.get('social_followers') as string, 10) || 0;

  const admin = createAdminClient();

  const { data: profile, error: fetchErr } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single<{ id: string }>();

  if (fetchErr || !profile) return { error: 'Profile not found.', success: false };

  // Recalculate profile completion
  const { data: existing } = await admin
    .from('profiles')
    .select('username, quest_completions')
    .eq('id', profile.id)
    .single<{ username: string; quest_completions: number }>();

  const profile_completion =
    20 +
    (bio              ? 10 : 0) +
    30 +
    (social_followers ? 10 : 0);

  const { error } = await admin
    .from('profiles')
    .update({ bio: bio || null, instagram_handle: instagram_handle || null, social_followers, profile_completion })
    .eq('id', profile.id);

  if (error) return { error: error.message, success: false };

  revalidatePath('/profile');
  revalidatePath('/settings');
  return { error: null, success: true };
}

export async function updateCar(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.', success: false };

  const make  = (formData.get('make')  as string).trim();
  const model = (formData.get('model') as string).trim();
  const year  = parseInt(formData.get('year') as string, 10);
  const mods  = (formData.get('mods')  as string).trim();

  if (!make || !model) return { error: 'Make and model are required.', success: false };
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1)
    return { error: 'Enter a valid year.', success: false };

  const admin = createAdminClient();

  const { data: profile, error: fetchErr } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single<{ id: string }>();

  if (fetchErr || !profile) return { error: 'Profile not found.', success: false };

  const { error } = await admin
    .from('cars')
    .upsert({ user_id: profile.id, make, model, year, mods: mods || null }, { onConflict: 'user_id' });

  if (error) return { error: error.message, success: false };

  revalidatePath('/profile');
  revalidatePath('/settings');
  return { error: null, success: true };
}
