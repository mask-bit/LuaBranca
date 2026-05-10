import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileForUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Codigo ausente.")}`, request.url));
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Supabase nao configurado.")}`, request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileForUser(user);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
