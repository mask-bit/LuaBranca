export const PUBLIC_BUCKET = "lua-branca-public";
export const PRIVATE_BUCKET = "lua-branca-private";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    url,
    anonKey,
    serviceRoleKey,
    configured: Boolean(url && anonKey),
    serviceRoleConfigured: Boolean(url && serviceRoleKey),
  };
}

export function getAdminEmails() {
  return (process.env.LUA_BRANCA_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isBootstrapAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
