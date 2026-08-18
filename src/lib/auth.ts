import { createHmac } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "bebitos_admin_session";

function sign(value: string) {
  const secret = process.env.ADMIN_SECRET || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function checkCredentials(user: string, password: string) {
  return (
    user === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  );
}

export async function createSession() {
  const value = "authenticated";
  const signature = sign(value);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${value}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return false;
  const [value, signature] = cookie.value.split(".");
  if (!value || !signature) return false;
  return sign(value) === signature;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
