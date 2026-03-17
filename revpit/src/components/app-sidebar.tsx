import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SidebarClient } from './sidebar-client';
import type { SidebarProfile } from './sidebar-client';

/**
 * AppSidebar — server component wrapper.
 * Fetches auth + profile data, then delegates rendering to SidebarClient
 * (client component) which handles all interactivity and animations.
 */
export default async function AppSidebar() {
  const { userId } = await auth();

  let profile: SidebarProfile = null;
  if (userId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('profiles')
      .select('username, score, global_rank')
      .eq('clerk_id', userId)
      .single<SidebarProfile>();
    profile = data;
  }

  return <SidebarClient profile={profile} />;
}
