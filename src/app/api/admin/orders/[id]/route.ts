import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireWriteAccess,
  requireDeleteAccess,
} from "@/lib/permissions";

const VALID_STATUSES = [
  "pendiente",
  "confirmado",
  "enviado",
  "entregado",
  "cancelado",
];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["enviado", "entregado", "cancelado"],
  enviado: ["entregado", "cancelado"],
  entregado: [],
  cancelado: ["pendiente"],
};

type StockItem = {
  productId: string;
  productName: string;
  quantity: number;
};

function aggregateItems(items: StockItem[]) {
  const totals = new Map<
    string,
    { productId: string; productName: string; quantity: number }
  >();

  for (const item of items) {
    const current = totals.get(item.productId);

    if (current) {
      current.quantity += item.quantity;
    } else {
      totals.set(item.productId, {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      });
    }
  }

  return Array.from(totals.values());
}

export async function PATCH(
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
    const body = await req.json();
    const status =
      typeof body.status === "string" ? body.status : "";

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error("Pedido no encontrado");
      }

      if (existing.anulado) {
        throw new Error(
          "Este pedido está anulado y no se puede modificar"
        );
      }

      if (existing.status === status) {
        return existing;
      }

      const allowedNext =
        ALLOWED_TRANSITIONS[existing.status] || [];

      if (!allowedNext.includes(status)) {
        throw new Error(
          `No se puede pasar de "${existing.status}" a "${status}" directamente`
        );
      }

      const stockItems = aggregateItems(existing.items);

      /*
       * CONFIRMAR
       *
       * Primero reclamamos el pedido de forma atómica.
       * Si otra solicitud ya lo confirmó/canceló,
       * updateMany devolverá 0 y no se tocará stock.
       */
      if (
        existing.status === "pendiente" &&
        status === "confirmado"
      ) {
        const claimed = await tx.order.updateMany({
          where: {
            id,
            status: "pendiente",
            anulado: false,
            stockDeducted: false,
          },
          data: {
            status: "confirmado",
            stockDeducted: true,
          },
        });

        if (claimed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras lo modificabas. Actualiza la página e intenta nuevamente"
          );
        }

        for (const item of stockItems) {
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: {
                gte: item.quantity,
              },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (updated.count !== 1) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true },
            });

            throw new Error(
              `Stock insuficiente para confirmar "${item.productName}" (disponible: ${product?.stock ?? 0})`
            );
          }

          await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: {
                lte: 0,
              },
            },
            data: {
              inStock: false,
            },
          });
        }
      } else if (status === "cancelado") {
        /*
         * CANCELAR
         *
         * El estado de pago forma parte de la condición
         * para evitar una carrera entre "pagar" y
         * "cancelar".
         */
        if (existing.paymentStatus === "pagado") {
          throw new Error(
            "El pedido está pagado. Registra el reembolso antes de cancelarlo"
          );
        }

        const claimed = await tx.order.updateMany({
          where: {
            id,
            status: existing.status,
            anulado: false,
            stockDeducted: existing.stockDeducted,
            paymentStatus: existing.paymentStatus,
          },
          data: {
            status: "cancelado",
            stockDeducted: false,
          },
        });

        if (claimed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras lo modificabas. Actualiza la página e intenta nuevamente"
          );
        }

        if (existing.stockDeducted) {
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
      } else if (
        existing.status === "cancelado" &&
        status === "pendiente"
      ) {
        const claimed = await tx.order.updateMany({
          where: {
            id,
            status: "cancelado",
            anulado: false,
            stockDeducted: existing.stockDeducted,
            paymentStatus: existing.paymentStatus,
          },
          data: {
            status: "pendiente",
            stockDeducted: false,

            ...(existing.paymentStatus === "reembolsado"
              ? {
                  paymentStatus: "pendiente",
                  paidAt: null,
                }
              : {}),
          },
        });

        if (claimed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras lo modificabas. Actualiza la página e intenta nuevamente"
          );
        }
      } else {
        /*
         * confirmado -> enviado
         * confirmado -> entregado
         * enviado -> entregado
         *
         * También usamos transición condicional para que
         * dos botones simultáneos no sobrescriban estados.
         */
        const claimed = await tx.order.updateMany({
          where: {
            id,
            status: existing.status,
            anulado: false,
            stockDeducted: existing.stockDeducted,
          },
          data: {
            status: status as
              | "pendiente"
              | "confirmado"
              | "enviado"
              | "entregado"
              | "cancelado",

            ...(status === "entregado"
              ? {
                  deliveredAt:
                    existing.deliveredAt ?? new Date(),
                }
              : {}),
          },
        });

        if (claimed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras lo modificabas. Actualiza la página e intenta nuevamente"
          );
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireDeleteAccess();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existing) {
        throw new Error("Pedido no encontrado");
      }

      if (
        existing.status !== "pendiente" &&
        existing.status !== "cancelado"
      ) {
        throw new Error(
          "Solo se pueden eliminar pedidos pendientes o cancelados"
        );
      }

      if (
        existing.paymentStatus !== "pendiente" ||
        existing.anulado
      ) {
        throw new Error(
          "Este pedido forma parte del historial financiero y no se puede eliminar"
        );
      }

      const stockItems = aggregateItems(existing.items);

      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      const deleted = await tx.order.deleteMany({
        where: {
          id,
          status: existing.status,
          paymentStatus: "pendiente",
          anulado: false,
          stockDeducted: existing.stockDeducted,
        },
      });

      if (deleted.count !== 1) {
        throw new Error(
          "El pedido cambió mientras lo eliminabas. Actualiza la página e intenta nuevamente"
        );
      }

      if (existing.stockDeducted) {
        for (const item of stockItems) {
          await tx.product.updateMany({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
              inStock: true,
            },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
