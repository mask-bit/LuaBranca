import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  const env = getSupabaseEnv();

  if (!env.serviceRoleConfigured || !env.url || !env.serviceRoleKey) {
    return null;
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
