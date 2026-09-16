import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

export async function PUT(req: NextRequest) {
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  const { items } = await req.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((item: { id: string; order: number }) =>
      prisma.product.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );

  return NextResponse.json({ ok: true });
}
