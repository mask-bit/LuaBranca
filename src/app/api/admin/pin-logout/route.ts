import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_PIN_COOKIE } from "@/lib/admin-pin";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(ADMIN_PIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
