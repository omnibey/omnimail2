import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates an administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * This client runs strictly on the server and bypasses Row Level Security.
 * WARNING: Never import or call this function in client components.
 */
export function createAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('placeholder')) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
