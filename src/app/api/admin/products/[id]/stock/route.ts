import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { stock, lowStockThreshold } = await req.json();

    if (typeof stock !== "number" || isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock inválido" }, { status: 400 });
    }

    const data: { stock: number; inStock: boolean; lowStockThreshold?: number } = {
      stock,
      inStock: stock > 0,
    };

    if (typeof lowStockThreshold === "number" && !isNaN(lowStockThreshold) && lowStockThreshold >= 0) {
      data.lowStockThreshold = lowStockThreshold;
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
