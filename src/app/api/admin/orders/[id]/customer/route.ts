import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";
import { validateCliente } from "@/lib/validation";

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

    const validation = validateCliente(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string" &&
      body.email.trim()
        ? body.email.trim()
        : null;

    const order = await prisma.$transaction(
      async (tx) => {
        const existing =
          await tx.order.findUnique({
            where: { id },
          });

        if (!existing) {
          throw new Error(
            "Pedido no encontrado"
          );
        }

        if (existing.origin !== "online") {
          throw new Error(
            "Esta acción solo corresponde a pedidos online"
          );
        }

        if (existing.anulado) {
          throw new Error(
            "No se puede asignar cliente a un pedido anulado"
          );
        }

        if (existing.status !== "pendiente") {
          throw new Error(
            "El cliente solo puede asignarse mientras el pedido está pendiente"
          );
        }

        let cliente =
          await tx.cliente.findFirst({
            where: { phone },
          });

        if (!cliente) {
          cliente =
            await tx.cliente.create({
              data: {
                name,
                phone,
                email,
              },
            });
        }

        const changed =
          await tx.order.updateMany({
            where: {
              id,
              status: "pendiente",
              origin: "online",
              anulado: false,
            },
            data: {
              clienteId: cliente.id,
              customer: cliente.name,
              phone: cliente.phone,
              email:
                cliente.email ?? email,
            },
          });

        if (changed.count !== 1) {
          throw new Error(
            "El pedido cambió mientras asignabas el cliente. Actualiza la página e intenta nuevamente"
          );
        }

        const updated =
          await tx.order.findUnique({
            where: { id },
            include: {
              items: true,
            },
          });

        if (!updated) {
          throw new Error(
            "Pedido no encontrado"
          );
        }

        return updated;
      }
    );

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
