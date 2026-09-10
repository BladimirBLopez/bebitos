import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      return NextResponse.json({ error: "Usuario no encontrado o inactivo" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // --- DIAGNÓSTICO TEMPORAL ---
    let sessionError: string | null = null;
    try {
      await createSession(user.id);
    } catch (e: any) {
      sessionError = e?.message || String(e);
    }
    const cookieStoreAfter = await cookies();
    const cookieAfter = cookieStoreAfter.get("admin_session");

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      debug: {
        serverTime: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        sessionError,
        cookieVisibleAfterSet: !!cookieAfter,
        cookieValuePreview: cookieAfter ? cookieAfter.value.slice(0, 15) + "..." : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Error interno", debugCatch: err?.message || String(err) }, { status: 500 });
  }
}
