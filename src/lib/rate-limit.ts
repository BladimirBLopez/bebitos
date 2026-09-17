import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(
  req: NextRequest,
  routeName: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMinutes: number }> {
  const ip = getClientIp(req);
  const key = `${routeName}:${ip}`;
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (existing) {
    const elapsed = now.getTime() - existing.firstAttempt.getTime();
    if (elapsed < windowMs) {
      if (existing.attempts >= max) {
        const retryAfterMinutes = Math.ceil((windowMs - elapsed) / 60000);
        return { allowed: false, retryAfterMinutes };
      }
      await prisma.rateLimit.update({
        where: { key },
        data: { attempts: { increment: 1 } },
      });
      return { allowed: true, retryAfterMinutes: 0 };
    }
  }

  // Ventana nueva o expirada: reinicia el contador
  await prisma.rateLimit.upsert({
    where: { key },
    create: { key, attempts: 1, firstAttempt: now },
    update: { attempts: 1, firstAttempt: now },
  });

  return { allowed: true, retryAfterMinutes: 0 };
}
