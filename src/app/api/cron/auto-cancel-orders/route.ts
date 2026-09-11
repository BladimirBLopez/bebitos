import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pedidosVencidos = await prisma.order.findMany({
    where: {
      status: "pendiente",
      origin: "online",
      createdAt: { lt: limite },
    },
    include: { items: true },
  });

  let cancelados = 0;

  for (const order of pedidosVencidos) {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity }, inStock: true },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: "cancelado" },
      });
    });
    cancelados++;
  }

  return NextResponse.json({ ok: true, cancelados });
}
