import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role admin client — bypasses RLS.
 * Only use in server actions that have already validated the caller via Clerk.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
