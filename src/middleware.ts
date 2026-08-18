import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "bebitos_admin_session";

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isValidSession(cookieValue: string | undefined) {
  if (!cookieValue) return false;
  const [value, signature] = cookieValue.split(".");
  if (!value || !signature) return false;
  const secret = process.env.ADMIN_SECRET || "";
  const expected = await sign(value, secret);
  return expected === signature;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await isValidSession(cookie);
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
