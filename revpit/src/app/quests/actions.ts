'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function submitQuest(questId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const supabase = await createClient();

  // Guard against duplicate submissions
  const { data: existing } = await supabase
    .from('user_quests')
    .select('id, status')
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'approved') return { error: 'Quest already completed.' };
    if (existing.status === 'pending')  return { error: 'Quest already submitted — awaiting review.' };
  }

  const { error } = await supabase.from('user_quests').insert({
    user_id:      userId,
    quest_id:     questId,
    status:       'pending',
    progress:     100,
    submitted_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath('/quests');
  return {};
}
