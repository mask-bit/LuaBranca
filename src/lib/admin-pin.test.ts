import { describe, expect, it, beforeEach } from "vitest";
import { createAdminPinSessionValue, verifyAdminPin, verifyAdminPinSessionValue } from "@/lib/admin-pin";

describe("admin pin", () => {
  beforeEach(() => {
    process.env.LUA_BRANCA_ADMIN_PIN = "test-pin";
    process.env.LUA_BRANCA_ADMIN_SESSION_SECRET = "test-secret";
  });

  it("validates the configured pin", () => {
    expect(verifyAdminPin("test-pin")).toBe(true);
    expect(verifyAdminPin("000000")).toBe(false);
  });

  it("signs and validates an admin session", () => {
    const value = createAdminPinSessionValue(Date.now());
    expect(verifyAdminPinSessionValue(value)).toBe(true);
    expect(verifyAdminPinSessionValue(`${value}x`)).toBe(false);
  });
});
