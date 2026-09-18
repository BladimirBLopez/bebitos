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

    const existing = await prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    if (existing.anulado) {
      return NextResponse.json(
        { error: "La venta está anulada" },
        { status: 400 }
      );
    }

    if (
      existing.status === "cancelado" &&
      paymentStatus === "pagado"
    ) {
      return NextResponse.json(
        { error: "No se puede registrar un pago en un pedido cancelado" },
        { status: 400 }
      );
    }

    if (paymentStatus === "pagado") {
      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return NextResponse.json(
          {
            error:
              "Selecciona efectivo, QR o transferencia",
          },
          { status: 400 }
        );
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: "pagado",
          paymentMethod,
          paidAt: existing.paidAt ?? new Date(),
        },
        include: { items: true },
      });

      return NextResponse.json(order);
    }

    if (paymentStatus === "reembolsado") {
      if (existing.paymentStatus !== "pagado") {
        return NextResponse.json(
          {
            error:
              "Solo se puede reembolsar un pedido pagado",
          },
          { status: 400 }
        );
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: "reembolsado",
        },
        include: { items: true },
      });

      return NextResponse.json(order);
    }

    if (existing.paymentStatus === "pagado") {
      return NextResponse.json(
        {
          error:
            "Un pago registrado no puede volver a pendiente. Usa reembolso.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: "pendiente",
      },
      include: { items: true },
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
