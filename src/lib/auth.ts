import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { hasAdminPinSession } from "@/lib/admin-pin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv, isBootstrapAdminEmail } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  access_level: number;
  role: "viewer" | "editor" | "admin";
  created_at: string;
  updated_at: string;
};

export type AdminContext =
  | { configured: false; reason: string }
  | {
      configured: true;
      forbidden: boolean;
      authMethod: "pin" | "supabase";
      user: User | null;
      profile: Profile | null;
      serviceRoleMissing: boolean;
    };

export async function ensureProfileForUser(user: User) {
  const supabase = await createSupabaseServerClient();
  if (!supabase || !user.email) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const shouldBeAdmin = isBootstrapAdminEmail(user.email);
  const adminClient = createSupabaseAdminClient();

  if (existing) {
    if (shouldBeAdmin && existing.access_level < 4 && adminClient) {
      const { data } = await adminClient
        .from("profiles")
        .update({ access_level: 4, role: "admin", email: user.email })
        .eq("id", user.id)
        .select("*")
        .single<Profile>();
      return data ?? existing;
    }

    return existing;
  }

  const profilePayload = {
    id: user.id,
    email: user.email,
    display_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email.split("@")[0],
    access_level: shouldBeAdmin ? 4 : 1,
    role: shouldBeAdmin ? "admin" : "viewer",
  };

  const writer = shouldBeAdmin && adminClient ? adminClient : supabase;
  const { data } = await writer
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("*")
    .single<Profile>();

  return data;
}

export async function getProfileForCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return ensureProfileForUser(user);
}

export async function getAdminContext(minAccessLevel = 2, next = "/admin"): Promise<AdminContext> {
  const env = getSupabaseEnv();
  const hasPinSession = await hasAdminPinSession();

  if (!env.configured) {
    return {
      configured: false,
      reason: "A conexao com o banco ainda nao esta configurada no ambiente do servidor.",
    };
  }

  if (hasPinSession) {
    if (!env.serviceRoleConfigured) {
      return {
        configured: false,
        reason: "O painel reservado ainda precisa de uma credencial privada no servidor.",
      };
    }

    return {
      configured: true,
      forbidden: false,
      authMethod: "pin",
      user: null,
      profile: null,
      serviceRoleMissing: false,
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      reason: "Cliente Supabase indisponivel.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/?admin=pin&next=${encodeURIComponent(next)}`);
  }

  const profile = await ensureProfileForUser(user);

  if (!profile) {
    return {
      configured: false,
      reason: "Nao foi possivel criar ou carregar o perfil do usuario autenticado.",
    };
  }

  return {
    configured: true,
    forbidden: profile.access_level < minAccessLevel,
    authMethod: "supabase",
    user,
    profile,
    serviceRoleMissing: isBootstrapAdminEmail(user.email) && !env.serviceRoleConfigured,
  };
}

export async function getPinAdminClient(next = "/admin") {
  const context = await getAdminContext(4, next);

  if (!context.configured) {
    return { context, client: null };
  }

  if (context.authMethod !== "pin") {
    return { context, client: null };
  }

  return { context, client: createSupabaseAdminClient() };
}
