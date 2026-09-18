import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireDeleteAccess,
  requireWriteAccess,
} from "@/lib/permissions";

type BulkAction = "activar" | "desactivar" | "eliminar";

function parseIds(value: unknown) {
  if (!Array.isArray(value)) return null;

  const ids = [
    ...new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
    ),
  ];

  if (ids.length === 0 || ids.length > 200) {
    return null;
  }

  return ids;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const ids = parseIds(body?.ids);
  const action = body?.action as BulkAction;

  if (!ids) {
    return NextResponse.json(
      { error: "Selección de productos inválida" },
      { status: 400 }
    );
  }

  if (!["activar", "desactivar", "eliminar"].includes(action)) {
    return NextResponse.json(
      { error: "Acción inválida" },
      { status: 400 }
    );
  }

  if (action === "eliminar") {
    const user = await requireDeleteAccess();

    if (!user) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar" },
        { status: 403 }
      );
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      updated: result.count,
    });
  }

  const user = await requireWriteAccess();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  if (action === "activar") {
    /*
      Un producto sin stock nunca puede quedar disponible.
      Esto mantiene la misma regla aplicada en create/edit/stock.
    */
    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: ids,
        },
        stock: {
          gt: 0,
        },
      },
      data: {
        inStock: true,
      },
    });

    return NextResponse.json({
      ok: true,
      updated: result.count,
      skipped: ids.length - result.count,
    });
  }

  const result = await prisma.product.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      inStock: false,
    },
  });

  return NextResponse.json({
    ok: true,
    updated: result.count,
  });
}
