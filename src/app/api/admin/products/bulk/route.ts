import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess, requireDeleteAccess } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  const { ids, action } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Sin productos seleccionados" }, { status: 400 });
  }

  if (action === "eliminar") {
    const user = await requireDeleteAccess();
    if (!user) {
      return NextResponse.json({ error: "No tienes permiso para eliminar" }, { status: 403 });
    }
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true });
  }

  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  if (action === "activar") {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { inStock: true } });
  } else if (action === "desactivar") {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { inStock: false } });
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
