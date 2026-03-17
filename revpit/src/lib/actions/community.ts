'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Pit,
  Drop,
  Reply,
  DropType,
  DropTag,
  VoteType,
  FeedSort,
  PollOption,
} from '@/lib/types/community';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AUTHOR_SELECT = `
  author:profiles!author_id (
    username,
    avatar_url,
    score,
    tier
  )
`.trim();

const PIT_SELECT = `
  pit:pits!pit_id (
    name,
    display_name
  )
`.trim();

const PAGE_SIZE = 20;

// ─── 1. getPits ───────────────────────────────────────────────────────────────

export async function getPits(): Promise<Pit[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('pits')
    .select('*')
    .order('member_count', { ascending: false });

  if (error) {
    console.error('[getPits]', error.message);
    return [];
  }

  return data as Pit[];
}

// ─── 2. getPit ────────────────────────────────────────────────────────────────

export async function getPit(name: string): Promise<Pit | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('pits')
    .select('*')
    .eq('name', name)
    .maybeSingle();

  if (error) {
    console.error('[getPit]', error.message);
    return null;
  }

  return data as Pit | null;
}

// ─── 3. getDrops ─────────────────────────────────────────────────────────────

export async function getDrops(options: {
  pitName?: string;
  sort: FeedSort;
  filter?: string;
  page?: number;
}): Promise<Drop[]> {
  const { pitName, sort, filter = 'all', page = 0 } = options;
  const supabase = createAdminClient();

  let query = supabase
    .from('drops')
    .select(`*, ${AUTHOR_SELECT}, ${PIT_SELECT}`);

  // Filter by pit if provided
  if (pitName) {
    const pit = await getPit(pitName);
    if (pit) query = query.eq('pit_id', pit.id);
  }

  // Time filter for 'top' sort
  if (sort === 'top' && filter !== 'all') {
    const now = new Date();
    if (filter === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      query = query.gte('created_at', start.toISOString());
    } else if (filter === 'week') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      query = query.gte('created_at', start.toISOString());
    } else if (filter === 'month') {
      const start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      query = query.gte('created_at', start.toISOString());
    }
  }

  // Sort logic
  switch (sort) {
    case 'hot':
      query = query
        .order('score', { ascending: false })
        .order('created_at', { ascending: false });
      break;
    case 'new':
      query = query.order('created_at', { ascending: false });
      break;
    case 'top':
      query = query.order('rev_count', { ascending: false });
      break;
    case 'rising':
      // Wilson-score-like time decay: score / (age_hours + 2)^1.5
      // Supabase doesn't support computed order expressions, so fetch recent
      // drops and sort client-side for rising feed.
      query = query
        .order('created_at', { ascending: false })
        .limit(200); // oversample, then sort below
      break;
  }

  // Pagination via range (skip for rising — handled below)
  if (sort !== 'rising') {
    const from = page * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getDrops]', error.message);
    return [];
  }

  // Client-side sort + paginate for 'rising'
  if (sort === 'rising') {
    const now = Date.now();
    const sorted = (data as unknown as Drop[]).sort((a, b) => {
      const ageA = (now - new Date(a.created_at).getTime()) / 3_600_000;
      const ageB = (now - new Date(b.created_at).getTime()) / 3_600_000;
      const scoreA = a.rev_count / Math.pow(ageA + 2, 1.5);
      const scoreB = b.rev_count / Math.pow(ageB + 2, 1.5);
      return scoreB - scoreA;
    });
    const from = page * PAGE_SIZE;
    return sorted.slice(from, from + PAGE_SIZE) as Drop[];
  }

  return (data as unknown) as Drop[];
}

// ─── 4. getDrop ───────────────────────────────────────────────────────────────

export async function getDrop(id: string): Promise<Drop | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('drops')
    .select(`*, ${AUTHOR_SELECT}, ${PIT_SELECT}`)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getDrop]', error.message);
    return null;
  }

  return data as Drop | null;
}

// ─── 5. getReplies ────────────────────────────────────────────────────────────

export async function getReplies(dropId: string): Promise<Reply[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('replies')
    .select(`*, ${AUTHOR_SELECT}`)
    .eq('drop_id', dropId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getReplies]', error.message);
    return [];
  }

  return buildReplyTree((data as unknown) as Reply[]);
}

function buildReplyTree(flat: Reply[]): Reply[] {
  const map = new Map<string, Reply>();
  const roots: Reply[] = [];

  for (const reply of flat) {
    map.set(reply.id, { ...reply, children: [] });
  }

  for (const reply of map.values()) {
    if (reply.parent_reply_id) {
      const parent = map.get(reply.parent_reply_id);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(reply);
      } else {
        roots.push(reply); // orphaned — surface at root
      }
    } else {
      roots.push(reply);
    }
  }

  return roots;
}

// ─── 6. createDrop ───────────────────────────────────────────────────────────

export async function createDrop(data: {
  pitId: string;
  title: string;
  body?: string;
  type?: DropType;
  mediaUrls?: string[];
  pollOptions?: PollOption[];
  tag?: DropTag;
}): Promise<{ id: string } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (profileError || !profile) return { error: 'Profile not found.' };

  const { data: drop, error } = await admin
    .from('drops')
    .insert({
      pit_id:       data.pitId,
      author_id:    profile.id,
      title:        data.title,
      body:         data.body ?? null,
      type:         data.type ?? 'text',
      media_urls:   data.mediaUrls ?? null,
      poll_options: data.pollOptions ?? null,
      tag:          data.tag ?? null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  await updateCommunityScore(profile.id, 5);
  revalidatePath('/community');

  return { id: drop.id };
}

// ─── 7. createReply ───────────────────────────────────────────────────────────

export async function createReply(data: {
  dropId: string;
  body: string;
  parentReplyId?: string;
}): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (profileError || !profile) return { error: 'Profile not found.' };

  const { error } = await admin.from('replies').insert({
    drop_id:         data.dropId,
    author_id:       profile.id,
    parent_reply_id: data.parentReplyId ?? null,
    body:            data.body,
  });

  if (error) return { error: error.message };

  // Increment reply_count on the drop
  await admin.rpc('increment_reply_count', { drop_id: data.dropId });

  revalidatePath(`/community/drop/${data.dropId}`);
  return {};
}

// ─── 8. voteOnDrop ────────────────────────────────────────────────────────────

export async function voteOnDrop(
  dropId: string,
  vote: VoteType,
): Promise<{ rev_count: number; idle_count: number; score: number; user_vote: VoteType | null } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (profileError || !profile) return { error: 'Profile not found.' };

  // Fetch existing vote
  const { data: existing } = await admin
    .from('drop_votes')
    .select('id, vote')
    .eq('drop_id', dropId)
    .eq('user_id', profile.id)
    .maybeSingle();

  // Fetch current counts
  const { data: drop } = await admin
    .from('drops')
    .select('rev_count, idle_count, score')
    .eq('id', dropId)
    .single();

  if (!drop) return { error: 'Drop not found.' };

  let { rev_count, idle_count } = drop;
  let user_vote: VoteType | null = vote;

  if (existing) {
    if (existing.vote === vote) {
      // Same vote — remove it (toggle off)
      await admin.from('drop_votes').delete().eq('id', existing.id);
      if (vote === 'rev') rev_count = Math.max(0, rev_count - 1);
      else idle_count = Math.max(0, idle_count - 1);
      user_vote = null;
    } else {
      // Switching vote
      await admin
        .from('drop_votes')
        .update({ vote })
        .eq('id', existing.id);
      if (vote === 'rev') {
        rev_count += 1;
        idle_count = Math.max(0, idle_count - 1);
      } else {
        idle_count += 1;
        rev_count = Math.max(0, rev_count - 1);
      }
    }
  } else {
    // New vote
    await admin.from('drop_votes').insert({
      drop_id: dropId,
      user_id: profile.id,
      vote,
    });
    if (vote === 'rev') rev_count += 1;
    else idle_count += 1;
  }

  const score = rev_count - idle_count;

  await admin
    .from('drops')
    .update({ rev_count, idle_count, score })
    .eq('id', dropId);

  revalidatePath(`/community/drop/${dropId}`);

  return { rev_count, idle_count, score, user_vote };
}

// ─── 9. joinPit ───────────────────────────────────────────────────────────────

export async function joinPit(pitId: string): Promise<{ error?: string }> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated.' };

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (profileError || !profile) return { error: 'Profile not found.' };

  const { error } = await admin.from('pit_members').insert({
    pit_id:  pitId,
    user_id: profile.id,
    role:    'member',
  });

  if (error) {
    // Unique constraint — already a member
    if (error.code === '23505') return {};
    return { error: error.message };
  }

  await admin.rpc('increment_member_count', { pit_id: pitId });

  revalidatePath('/community');
  return {};
}

// ─── 10. updateCommunityScore ─────────────────────────────────────────────────

export async function updateCommunityScore(
  userId: string,
  points: number,
): Promise<{ error?: string }> {
  const admin = createAdminClient();

  const { data: profile, error: fetchError } = await admin
    .from('profiles')
    .select('community_score, score')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) return { error: 'Profile not found.' };

  const { error } = await admin
    .from('profiles')
    .update({
      community_score: (profile.community_score ?? 0) + points,
      score:           (profile.score ?? 0) + points,
    })
    .eq('id', userId);

  if (error) return { error: error.message };

  return {};
}
