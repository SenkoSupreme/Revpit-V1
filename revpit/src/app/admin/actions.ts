'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRoleForUser } from '@/lib/roles';

// ── Auth guards ────────────────────────────────────────────────────────────────

async function assertModerator() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated.');
  const role = await getRoleForUser(userId);
  if (role !== 'admin' && role !== 'moderator')
    throw new Error('Insufficient permissions.');
  return { userId, role };
}

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated.');
  const role = await getRoleForUser(userId);
  if (role !== 'admin') throw new Error('Admin access required. Moderators cannot alter roles.');
  return { userId, role };
}

// ── Action logger ──────────────────────────────────────────────────────────────

type LogPayload = {
  actorId:     string;
  action:      string;
  targetType?: string;
  targetId?:   string;
  targetLabel?: string;
};

async function logAction({ actorId, action, targetType, targetId, targetLabel }: LogPayload) {
  const supabase = createAdminClient();

  // Fetch actor's profile (username + email + role) for the log row
  const { data: actor } = await supabase
    .from('profiles')
    .select('username, email, role')
    .eq('clerk_id', actorId)
    .maybeSingle();

  await supabase.from('admin_logs').insert({
    actor_id:       actorId,
    actor_username: actor?.username ?? 'unknown',
    actor_email:    actor?.email    ?? null,
    actor_role:     actor?.role     ?? 'unknown',
    action,
    target_type:    targetType  ?? null,
    target_id:      targetId    ?? null,
    target_label:   targetLabel ?? null,
  });
}

// ─── Store moderation ─────────────────────────────────────────────────────────

/**
 * Approve a pending store listing. Moderator or admin only.
 */
export async function approveListing(listingId: string): Promise<{ error?: string }> {
  let actor: { userId: string; role: string };
  try { actor = await assertModerator(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const supabase = createAdminClient();

  // Fetch listing title for the log
  const { data: listing } = await supabase
    .from('store_listings')
    .select('title, seller_username')
    .eq('id', listingId)
    .maybeSingle();

  const { error } = await supabase
    .from('store_listings')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', listingId);

  if (error) return { error: error.message };

  await logAction({
    actorId:     actor.userId,
    action:      'APPROVE_LISTING',
    targetType:  'listing',
    targetId:    listingId,
    targetLabel: listing ? `"${listing.title}" by @${listing.seller_username}` : listingId,
  });

  revalidatePath('/store');
  revalidatePath('/admin/store');
  revalidatePath('/admin/logs');
  return {};
}

/**
 * Reject a pending store listing. Moderator or admin only.
 */
export async function rejectListing(listingId: string): Promise<{ error?: string }> {
  let actor: { userId: string; role: string };
  try { actor = await assertModerator(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from('store_listings')
    .select('title, seller_username')
    .eq('id', listingId)
    .maybeSingle();

  const { error } = await supabase
    .from('store_listings')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', listingId);

  if (error) return { error: error.message };

  await logAction({
    actorId:     actor.userId,
    action:      'REJECT_LISTING',
    targetType:  'listing',
    targetId:    listingId,
    targetLabel: listing ? `"${listing.title}" by @${listing.seller_username}` : listingId,
  });

  revalidatePath('/store');
  revalidatePath('/admin/store');
  revalidatePath('/admin/logs');
  return {};
}

/**
 * Force-delete any listing. Moderator or admin only.
 */
export async function adminDeleteListing(listingId: string): Promise<{ error?: string }> {
  let actor: { userId: string; role: string };
  try { actor = await assertModerator(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const supabase = createAdminClient();

  const { data: listing } = await supabase
    .from('store_listings')
    .select('title, seller_username')
    .eq('id', listingId)
    .maybeSingle();

  const { error } = await supabase.from('store_listings').delete().eq('id', listingId);
  if (error) return { error: error.message };

  await logAction({
    actorId:     actor.userId,
    action:      'DELETE_LISTING',
    targetType:  'listing',
    targetId:    listingId,
    targetLabel: listing ? `"${listing.title}" by @${listing.seller_username}` : listingId,
  });

  revalidatePath('/store');
  revalidatePath('/admin/store');
  revalidatePath('/admin/logs');
  return {};
}

// ─── Community moderation ─────────────────────────────────────────────────────

/**
 * Delete a community drop (post). Moderator or admin only.
 */
export async function adminDeleteDrop(dropId: string): Promise<{ error?: string }> {
  let actor: { userId: string; role: string };
  try { actor = await assertModerator(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const supabase = createAdminClient();

  const { data: drop } = await supabase
    .from('drops')
    .select('title, profiles(username)')
    .eq('id', dropId)
    .maybeSingle() as { data: { title: string; profiles: { username: string } | null } | null };

  const { error } = await supabase.from('drops').delete().eq('id', dropId);
  if (error) return { error: error.message };

  await logAction({
    actorId:     actor.userId,
    action:      'DELETE_DROP',
    targetType:  'drop',
    targetId:    dropId,
    targetLabel: drop ? `"${drop.title}" by @${drop.profiles?.username ?? 'unknown'}` : dropId,
  });

  revalidatePath('/community');
  revalidatePath('/admin/community');
  revalidatePath('/admin/logs');
  return {};
}

/**
 * Delete a reply. Moderator or admin only.
 */
export async function adminDeleteReply(replyId: string): Promise<{ error?: string }> {
  let actor: { userId: string; role: string };
  try { actor = await assertModerator(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const supabase = createAdminClient();

  const { data: reply } = await supabase
    .from('replies')
    .select('body, profiles(username)')
    .eq('id', replyId)
    .maybeSingle() as { data: { body: string; profiles: { username: string } | null } | null };

  const { error } = await supabase.from('replies').delete().eq('id', replyId);
  if (error) return { error: error.message };

  await logAction({
    actorId:     actor.userId,
    action:      'DELETE_REPLY',
    targetType:  'reply',
    targetId:    replyId,
    targetLabel: reply
      ? `"${reply.body.slice(0, 60)}…" by @${reply.profiles?.username ?? 'unknown'}`
      : replyId,
  });

  revalidatePath('/community');
  revalidatePath('/admin/community');
  revalidatePath('/admin/logs');
  return {};
}

// ─── User management (admin only) ─────────────────────────────────────────────

export type SetRoleState = { error: string | null; success?: boolean };

/**
 * Set a user's role. Admin only.
 * Moderators are explicitly blocked — they cannot alter any role, including their own.
 */
export async function setUserRole(
  _prev: SetRoleState,
  formData: FormData,
): Promise<SetRoleState> {
  let actor: { userId: string; role: string };
  try { actor = await assertAdmin(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const targetClerkId = (formData.get('clerk_id') as string | null)?.trim();
  const newRole       = formData.get('role') as string | null;

  if (!targetClerkId) return { error: 'User ID required.' };
  if (!newRole || !['user', 'moderator', 'admin'].includes(newRole))
    return { error: 'Invalid role.' };

  const supabase = createAdminClient();

  // Fetch target profile for the log
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('username, email, role')
    .eq('clerk_id', targetClerkId)
    .maybeSingle();

  const previousRole = targetProfile?.role ?? 'unknown';

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('clerk_id', targetClerkId);

  if (error) return { error: error.message };

  // Keep role_assignments in sync
  if (newRole !== 'user' && targetProfile?.email) {
    await supabase.from('role_assignments').upsert(
      { email: targetProfile.email, role: newRole },
      { onConflict: 'email' },
    );
  } else if (newRole === 'user' && targetProfile?.email) {
    // Downgrading — remove the pre-grant so it doesn't re-apply on next login
    await supabase.from('role_assignments').delete().eq('email', targetProfile.email);
  }

  await logAction({
    actorId:     actor.userId,
    action:      'SET_ROLE',
    targetType:  'user',
    targetId:    targetClerkId,
    targetLabel: targetProfile
      ? `@${targetProfile.username} (${previousRole} → ${newRole})`
      : `${targetClerkId} (→ ${newRole})`,
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/logs');
  return { error: null, success: true };
}

/**
 * Grant a role by email (pre-grant before signup). Admin only.
 */
export async function grantRoleByEmail(
  _prev: SetRoleState,
  formData: FormData,
): Promise<SetRoleState> {
  let actor: { userId: string; role: string };
  try { actor = await assertAdmin(); } catch (e: unknown) { return { error: (e as Error).message }; }

  const email   = (formData.get('email') as string | null)?.trim().toLowerCase();
  const newRole = formData.get('role') as string | null;

  if (!email) return { error: 'Email is required.' };
  if (!newRole || !['moderator', 'admin'].includes(newRole))
    return { error: 'Select moderator or admin.' };

  const supabase = createAdminClient();

  const { error: raError } = await supabase.from('role_assignments').upsert(
    { email, role: newRole },
    { onConflict: 'email' },
  );
  if (raError) return { error: raError.message };

  // Apply immediately if the profile already exists
  await supabase.from('profiles').update({ role: newRole }).eq('email', email);

  await logAction({
    actorId:     actor.userId,
    action:      'GRANT_ROLE_BY_EMAIL',
    targetType:  'user',
    targetLabel: `${email} → ${newRole}`,
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/logs');
  return { error: null, success: true };
}
