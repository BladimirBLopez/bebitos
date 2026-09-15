import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

// Qué estados puede alcanzar un pedido desde cada estado actual.
// confirmado puede ir directo a entregado (venta entregada en mano, sin envío).
// entregado es final. cancelado solo puede reactivarse a pendiente.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pendiente: ["confirmado", "cancelado"],
  confirmado: ["enviado", "entregado", "cancelado"],
  enviado: ["entregado", "cancelado"],
  entregado: [],
  cancelado: ["pendiente"],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!existing) {
        throw new Error("Pedido no encontrado");
      }

      if (existing.status === status) {
        return existing;
      }

      const allowedNext = ALLOWED_TRANSITIONS[existing.status] || [];
      if (!allowedNext.includes(status)) {
        throw new Error(
          `No se puede pasar de "${existing.status}" a "${status}" directamente`
        );
      }

      let newStockDeducted = existing.stockDeducted;

      // Confirmar un pedido que todavía no había reservado stock (pedidos online
      // pendientes no reservan nada hasta que se confirman) => reservar ahora.
      if (status === "confirmado" && !existing.stockDeducted) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para confirmar "${item.productName}" (disponible: ${product?.stock ?? 0})`
            );
          }
        }
        for (const item of existing.items) {
          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
          await tx.product.update({
            where: { id: item.productId },
            data: { inStock: updated.stock > 0 },
          });
        }
        newStockDeducted = true;
      }

      // Cancelar: si el pedido tenía stock reservado, devolverlo. Si nunca lo tomó
      // (online todavía pendiente), no hay nada que devolver.
      if (status === "cancelado" && existing.stockDeducted) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity }, inStock: true },
          });
        }
        newStockDeducted = false;
      }

      return tx.order.update({
        where: { id },
        data: { status, stockDeducted: newStockDeducted },
        include: { items: true },
      });
    });

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

      if (existing.stockDeducted) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity }, inStock: true },
          });
        }
      }

      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
