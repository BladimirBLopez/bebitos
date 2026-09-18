import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireWriteAccess();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const motivo =
      typeof body.motivo === "string"
        ? body.motivo.trim().slice(0, 500)
        : "";

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error("Pedido no encontrado");
      }

      if (existing.anulado) {
        throw new Error("Este pedido ya está anulado");
      }

      if (existing.status !== "entregado") {
        throw new Error(
          'Solo se puede anular un pedido que ya está "entregado"'
        );
      }

      const nextPaymentStatus =
        existing.paymentStatus === "pagado"
          ? "reembolsado"
          : existing.paymentStatus;

      /*
       * Reclamamos la anulación antes de devolver stock.
       * Así dos solicitudes simultáneas no pueden
       * devolver las mismas unidades dos veces.
       */
      const claimed = await tx.order.updateMany({
        where: {
          id,
          status: "entregado",
          anulado: false,
          stockDeducted: existing.stockDeducted,
          paymentStatus: existing.paymentStatus,
        },
        data: {
          anulado: true,
          anuladoEn: new Date(),
          motivoAnulacion: motivo || null,
          paymentStatus: nextPaymentStatus,
          stockDeducted: false,
        },
      });

      if (claimed.count !== 1) {
        throw new Error(
          "La venta cambió mientras intentabas anularla. Actualiza la página e intenta nuevamente"
        );
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

      const updated = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!updated) {
        throw new Error("Pedido no encontrado");
      }

      return updated;
    });

    return NextResponse.json(order);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
