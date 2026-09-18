import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

// Acción separada del cambio de estado: solo se puede anular un pedido que
// ya está "entregado". No reescribe el estado (sigue diciendo "entregado"
// en el historial), solo marca anulado=true, devuelve el stock y guarda
// cuándo y por qué se anuló.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const motivo = typeof body.motivo === "string" ? body.motivo.trim() : "";

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
        throw new Error('Solo se puede anular un pedido que ya está "entregado"');
      }

      if (existing.stockDeducted) {
        for (const item of existing.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity }, inStock: true },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: {
          anulado: true,
          anuladoEn: new Date(),
          motivoAnulacion: motivo || null,
          paymentStatus:
            existing.paymentStatus === "pagado"
              ? "reembolsado"
              : existing.paymentStatus,
          stockDeducted: false,
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
