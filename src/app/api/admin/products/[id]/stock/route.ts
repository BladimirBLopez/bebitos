import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { stock } = await req.json();

    if (typeof stock !== "number" || isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock inválido" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        stock,
        inStock: stock > 0,
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
