import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

const PAYMENT_METHODS = [
  "efectivo",
  "qr",
  "transferencia",
];

const PAYMENT_STATUSES = [
  "pendiente",
  "pagado",
  "reembolsado",
];

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

    const paymentStatus =
      typeof body.paymentStatus === "string"
        ? body.paymentStatus
        : "";

    const paymentMethod =
      typeof body.paymentMethod === "string"
        ? body.paymentMethod
        : "";

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Estado de pago inválido" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Pedido no encontrado");
      }

      if (existing.anulado) {
        throw new Error("La venta está anulada");
      }

      // Un pedido online debe tener un cliente real asignado
      // antes de poder registrar cualquier pago.
      if (
        existing.origin === "online" &&
        paymentStatus === "pagado" &&
        (
          !existing.clienteId ||
          !existing.phone.trim() ||
          existing.customer === "Sin cliente asignado"
        )
      ) {
        throw new Error(
          "Asigna un cliente al pedido antes de registrar el pago"
        );
      }

      if (existing.paymentStatus === paymentStatus) {
        if (paymentStatus === "pagado") {
          if (!PAYMENT_METHODS.includes(paymentMethod)) {
            throw new Error(
              "Selecciona efectivo, QR o transferencia"
            );
          }

          const changed = await tx.order.updateMany({
            where: {
              id,
              paymentStatus: "pagado",
              anulado: false,
              status: {
                not: "cancelado",
              },
            },
            data: {
              paymentMethod,
            },
          });

          if (changed.count !== 1) {
            throw new Error(
              "El pedido cambió mientras registrabas el pago. Actualiza la página e intenta nuevamente"
            );
          }
        }

        const same = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!same) {
          throw new Error("Pedido no encontrado");
        }

        return same;
      }

      /*
       * Únicas transiciones financieras válidas:
       *
       * pendiente -> pagado
       * pagado    -> reembolsado
       *
       * reembolsado -> pendiente solo ocurre cuando
       * se reabre explícitamente un pedido cancelado.
       */
      if (
        existing.paymentStatus === "pendiente" &&
        paymentStatus === "pagado"
      ) {
        if (!PAYMENT_METHODS.includes(paymentMethod)) {
          throw new Error(
            "Selecciona efectivo, QR o transferencia"
          );
        }

        const changed = await tx.order.updateMany({
          where: {
            id,
            paymentStatus: "pendiente",
            anulado: false,
            status: {
              not: "cancelado",
            },
          },
          data: {
            paymentStatus: "pagado",
            paymentMethod,
            paidAt: existing.paidAt ?? new Date(),
          },
        });

        if (changed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras registrabas el pago. Actualiza la página e intenta nuevamente"
          );
        }
      } else if (
        existing.paymentStatus === "pagado" &&
        paymentStatus === "reembolsado"
      ) {
        const changed = await tx.order.updateMany({
          where: {
            id,
            paymentStatus: "pagado",
            anulado: false,
          },
          data: {
            paymentStatus: "reembolsado",
          },
        });

        if (changed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras registrabas el reembolso. Actualiza la página e intenta nuevamente"
          );
        }
      } else {
        throw new Error(
          `No se puede cambiar el pago de "${existing.paymentStatus}" a "${paymentStatus}"`
        );
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
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error interno";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
