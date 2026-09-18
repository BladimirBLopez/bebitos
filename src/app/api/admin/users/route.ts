import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdminOnly } from "@/lib/permissions";

export async function GET() {
  const user = await requireAdminOnly();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para ver esta sección" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json(users, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await requireAdminOnly();
  if (!currentUser) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  try {
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
        role: role || "VIEWER",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
