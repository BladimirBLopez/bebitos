import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type StockItem = {
  productId: string;
  quantity: number;
};

function aggregateItems(items: StockItem[]) {
  const totals = new Map<string, number>();

  for (const item of items) {
    totals.set(
      item.productId,
      (totals.get(item.productId) ?? 0) +
        item.quantity
    );
  }

  return Array.from(
    totals,
    ([productId, quantity]) => ({
      productId,
      quantity,
    })
  );
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no está configurado" },
      { status: 503 }
    );
  }

  const authHeader =
    req.headers.get("authorization");

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  const limite = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  );

  /*
   * Solo pedidos online realmente pendientes
   * y sin pago registrado.
   */
  const candidatos = await prisma.order.findMany({
    where: {
      status: "pendiente",
      origin: "online",
      paymentStatus: "pendiente",
      anulado: false,
      createdAt: {
        lt: limite,
      },
    },
    select: {
      id: true,
    },
  });

  let cancelados = 0;

  for (const candidate of candidatos) {
    const cancelled = await prisma.$transaction(
      async (tx) => {
        /*
         * Volvemos a leer DENTRO de la transacción.
         * La lista inicial puede haberse quedado vieja
         * mientras un administrador confirma o cobra.
         */
        const existing =
          await tx.order.findUnique({
            where: {
              id: candidate.id,
            },
            include: {
              items: true,
            },
          });

        if (
          !existing ||
          existing.status !== "pendiente" ||
          existing.origin !== "online" ||
          existing.paymentStatus !== "pendiente" ||
          existing.anulado ||
          existing.createdAt >= limite
        ) {
          return false;
        }

        const claimed =
          await tx.order.updateMany({
            where: {
              id: existing.id,
              status: "pendiente",
              origin: "online",
              paymentStatus: "pendiente",
              anulado: false,
              stockDeducted:
                existing.stockDeducted,
              createdAt: {
                lt: limite,
              },
            },
            data: {
              status: "cancelado",
              stockDeducted: false,
            },
          });

        if (claimed.count !== 1) {
          return false;
        }

        if (existing.stockDeducted) {
          const stockItems = aggregateItems(
            existing.items
          );

          for (const item of stockItems) {
            await tx.product.updateMany({
              where: {
                id: item.productId,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
                inStock: true,
              },
            });
          }
        }

        return true;
      }
    );

    if (cancelled) {
      cancelados++;
    }
  }

  return NextResponse.json({
    ok: true,
    revisados: candidatos.length,
    cancelados,
  });
}
