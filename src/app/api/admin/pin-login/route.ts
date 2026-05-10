import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_PIN_COOKIE,
  adminPinCookieOptions,
  createAdminPinSessionValue,
  verifyAdminPin,
} from "@/lib/admin-pin";

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let pin = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
    pin = typeof body?.pin === "string" ? body.pin : "";
  } else {
    const formData = await request.formData().catch(() => null);
    const value = formData?.get("pin");
    pin = typeof value === "string" ? value : "";
  }

  if (!verifyAdminPin(pin)) {
    return NextResponse.json({ ok: false, error: "PIN invalido." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirectTo: "/admin" });
  response.cookies.set(ADMIN_PIN_COOKIE, createAdminPinSessionValue(), adminPinCookieOptions());
  return response;
}
