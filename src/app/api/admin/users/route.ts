import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // --- DIAGNÓSTICO TEMPORAL ---
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    const headerStore = await headers();
    const rawCookieHeader = headerStore.get("cookie");

    let jwtError: string | null = null;
    let payload: any = null;
    if (token) {
      try {
        const secretKey = process.env.JWT_SECRET || "bebitos-secret-key";
        const encodedKey = new TextEncoder().encode(secretKey);
        const result = await jwtVerify(token, encodedKey);
        payload = result.payload;
      } catch (e: any) {
        jwtError = e?.message || String(e);
      }
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "No autorizado",
          debug: {
            hasCookie: !!token,
            rawCookieHeader: rawCookieHeader,
            allCookieNames: cookieStore.getAll().map((c) => c.name),
            tokenPreview: token ? token.slice(0, 15) + "..." : null,
            jwtVerifyError: jwtError,
            decodedUserId: payload?.userId || null,
            hasJwtSecretEnv: !!process.env.JWT_SECRET,
          },
        },
        {
          status: 401,
          headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
        }
      );
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json(users, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nombre, email y password requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email ya existente" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role || "ADMIN",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
