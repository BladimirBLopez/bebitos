import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { stock } = await req.json();
    const inStock = stock > 0;

    await prisma.product.update({
      where: { id: req.url.split("/")[6] },
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
