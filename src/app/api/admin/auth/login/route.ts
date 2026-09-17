import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const now = new Date();

    // ¿Esta IP ya está bloqueada por demasiados intentos fallidos recientes?
    const existingAttempt = await prisma.loginAttempt.findUnique({ where: { ip } });
    if (existingAttempt) {
      const elapsed = now.getTime() - existingAttempt.firstAttempt.getTime();
      if (elapsed < WINDOW_MS && existingAttempt.attempts >= MAX_ATTEMPTS) {
        const remainingMinutes = Math.ceil((WINDOW_MS - elapsed) / 60000);
        return NextResponse.json(
          {
            error: `Demasiados intentos fallidos. Intenta de nuevo en ${remainingMinutes} minuto${
              remainingMinutes === 1 ? "" : "s"
            }.`,
          },
          { status: 429 }
        );
      }
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const isValid = user && user.active ? await bcrypt.compare(password, user.password) : false;

    if (!isValid) {
      const windowExpired =
        !existingAttempt || now.getTime() - existingAttempt.firstAttempt.getTime() > WINDOW_MS;

      if (windowExpired) {
        await prisma.loginAttempt.upsert({
          where: { ip },
          create: { ip, attempts: 1, firstAttempt: now },
          update: { attempts: 1, firstAttempt: now },
        });
      } else {
        await prisma.loginAttempt.update({
          where: { ip },
          data: { attempts: { increment: 1 } },
        });
      }

      // Mensaje único a propósito: no revela si el correo existe o no.
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // Login exitoso: se limpia el contador de intentos fallidos de esta IP.
    await prisma.loginAttempt.deleteMany({ where: { ip } });

    await createSession(user.id, user.role);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
