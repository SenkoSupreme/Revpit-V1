import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRoleForUser } from '@/lib/roles';
import { SidebarClient } from './sidebar-client';
import type { SidebarProfile } from './sidebar-client';

/**
 * AppSidebar — server component wrapper.
 * Fetches auth + profile + role, then delegates rendering to SidebarClient.
 * Also triggers role sync (applies pre-granted roles from role_assignments).
 */
export default async function AppSidebar() {
  const { userId } = await auth();

  let profile: SidebarProfile = null;
  let role: 'user' | 'moderator' | 'admin' = 'user';

  if (userId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('profiles')
      .select('username, score, global_rank')
      .eq('clerk_id', userId)
      .single<SidebarProfile>();
    profile = data;

    // Fetch role (also syncs pre-granted roles from role_assignments on first hit)
    role = await getRoleForUser(userId);
  }

  return <SidebarClient profile={profile} role={role} />;
}
