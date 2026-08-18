import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { ids, action } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "Sin productos seleccionados" }, { status: 400 });
  }

  if (action === "activar") {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { inStock: true } });
  } else if (action === "desactivar") {
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { inStock: false } });
  } else if (action === "eliminar") {
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
  } else {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
