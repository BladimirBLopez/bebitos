import { cookies } from "next/headers";

const COOKIE_NAME = "bebitos_admin_session";

async function sign(value: string) {
  const secret = process.env.ADMIN_SECRET || "";
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

export function checkCredentials(user: string, password: string) {
  return (
    user === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  );
}

export async function createSession() {
  const value = "authenticated";
  const signature = await sign(value);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${value}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
