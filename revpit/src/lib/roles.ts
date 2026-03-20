/**
 * Role utilities — server-only.
 *
 * Hierarchy: admin > moderator > user
 *
 * Flow:
 *  1. On every role check we read `profiles.role` from the DB.
 *  2. If the profile has no role yet (or it's 'user'), we cross-check
 *     `role_assignments` by the Clerk email. If a pre-grant exists we
 *     promote the profile row immediately so future checks are instant.
 */

import { auth, clerkClient } from '@clerk/nextjs/server';
import { createAdminClient } from './supabase/admin';

export type Role = 'user' | 'moderator' | 'admin';

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getClerkEmail(userId: string): Promise<string | null> {
  try {
    const client  = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    return clerkUser.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the current authenticated user's role.
 * Syncs from role_assignments if the stored role is 'user' (catches pre-grants).
 */
export async function getCurrentRole(): Promise<Role> {
  const { userId } = await auth();
  if (!userId) return 'user';

  return getRoleForUser(userId);
}

/**
 * Returns the role for an arbitrary clerk userId.
 * Syncs from role_assignments the first time if needed.
 */
export async function getRoleForUser(userId: string): Promise<Role> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('clerk_id', userId)
    .maybeSingle();

  const storedRole = (profile?.role ?? 'user') as Role;

  // Fast path — already elevated
  if (storedRole !== 'user') return storedRole;

  // Slow path — check role_assignments by email to catch pre-grants
  const email = profile?.email ?? (await getClerkEmail(userId));
  if (!email) return 'user';

  const { data: assignment } = await supabase
    .from('role_assignments')
    .select('role')
    .eq('email', email)
    .maybeSingle();

  if (!assignment) return 'user';

  const newRole = assignment.role as Role;

  // Persist so next request is instant
  await supabase
    .from('profiles')
    .update({ role: newRole, email })
    .eq('clerk_id', userId);

  return newRole;
}

/**
 * Throws (via notFound) if the current user is not at least a moderator.
 * Use in admin layout or page.
 */
export async function requireModerator(): Promise<Role> {
  const role = await getCurrentRole();
  if (role !== 'moderator' && role !== 'admin') {
    // Import notFound lazily to keep this file free of Next.js deps at module level
    const { notFound } = await import('next/navigation');
    notFound();
  }
  return role;
}

/**
 * Throws (via notFound) if the current user is not an admin.
 */
export async function requireAdmin(): Promise<void> {
  const role = await getCurrentRole();
  if (role !== 'admin') {
    const { notFound } = await import('next/navigation');
    notFound();
  }
}

/**
 * Syncs the Clerk email into the profile row and applies any pre-granted role.
 * Call this from server components that already have the userId in scope.
 */
export async function syncUserRole(userId: string): Promise<void> {
  await getRoleForUser(userId); // side-effect: persists if needed
}
