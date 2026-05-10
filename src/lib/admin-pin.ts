import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_PIN_COOKIE = "lua_branca_admin_pin";
export const ADMIN_PIN_MAX_AGE_SECONDS = 60 * 60 * 8;

function getConfiguredPin() {
  return process.env.LUA_BRANCA_ADMIN_PIN ?? "";
}

function getSessionSecret() {
  return (
    process.env.LUA_BRANCA_ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "lua-branca-dev-session-secret"
  );
}

function hmac(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPin(pin: string) {
  return safeEquals(pin.trim(), getConfiguredPin());
}

export function createAdminPinSessionValue(now = Date.now()) {
  const expiresAt = now + ADMIN_PIN_MAX_AGE_SECONDS * 1000;
  const payload = `pin-admin:${expiresAt}`;
  return `${expiresAt}.${hmac(payload)}`;
}

export function verifyAdminPinSessionValue(value: string | undefined) {
  if (!value) return false;

  const [rawExpiresAt, signature] = value.split(".");
  if (!rawExpiresAt || !signature) return false;

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return safeEquals(signature, hmac(`pin-admin:${expiresAt}`));
}

export async function hasAdminPinSession() {
  const cookieStore = await cookies();
  return verifyAdminPinSessionValue(cookieStore.get(ADMIN_PIN_COOKIE)?.value);
}

export function adminPinCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_PIN_MAX_AGE_SECONDS,
  };
}
