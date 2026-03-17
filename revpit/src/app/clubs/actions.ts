'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

export type CreateClubState = { error: string | null };

export async function createClub(
  _prev: CreateClubState,
  formData: FormData,
): Promise<CreateClubState> {
  const { userId } = await auth();
  if (!userId) return { error: 'You must be signed in to create a club.' };

  const name        = (formData.get('name')        as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim();
  const is_public   = formData.get('visibility') === 'public';

  if (!name)        return { error: 'Club name is required.' };
  if (name.length > 60)
    return { error: 'Club name must be 60 characters or fewer.' };
  if (description && description.length > 280)
    return { error: 'Description must be 280 characters or fewer.' };

  const supabase = createAdminClient();

  // Fetch owner username for denormalized display
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('clerk_id', userId)
    .single();

  const { error } = await supabase
    .from('clubs')
    .insert({
      name,
      description: description ?? '',
      is_public,
      owner_id:       userId,
      owner_username: profile?.username ?? 'unknown',
      member_count:   1,
    });

  if (error) return { error: error.message };

  redirect('/clubs');
}
