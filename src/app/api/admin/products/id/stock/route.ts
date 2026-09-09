import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { stock } = await req.json();

    // Calculate automatically if it is in stock or not
    const inStock = stock > 0;

    await prisma.product.update({
      where: { id: params.id },
      data: {
        stock,
        inStock,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
