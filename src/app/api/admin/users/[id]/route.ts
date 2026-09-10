import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { name, email, password, role } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email requeridos" }, { status: 400 });
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        ...(passwordHash ? { password: passwordHash } : {}),
        role,
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    if (currentUser.id === id) {
      return NextResponse.json({ error: "No puedes borrar tu propia cuenta" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
