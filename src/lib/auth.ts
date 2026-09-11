import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function getSecretKey(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET no está configurado. No se pueden crear sesiones seguras en producción."
    );
  }

  // Solo para desarrollo local, nunca en producción/preview
  return "bebitos-dev-only-secret";
}

const encodedKey = new TextEncoder().encode(getSecretKey());

export async function createSession(userId: string, role: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  (await cookies()).set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  (await cookies()).delete("admin_session");
}

export async function getCurrentUser() {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey);
    const userId = payload.userId as string;

    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, active: true },
    });
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || !user.active) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    return null;
  }
  return user;
}
