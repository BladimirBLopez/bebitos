import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const user = await requireWriteAccess();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "No tienes permiso para esta acción",
      },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const {
      stock,
      lowStockThreshold,
    } = await req.json();

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          error:
            "El stock debe ser un número entero mayor o igual a 0",
        },
        { status: 400 }
      );
    }

    if (
      lowStockThreshold !== undefined &&
      (
        typeof lowStockThreshold !== "number" ||
        !Number.isInteger(
          lowStockThreshold
        ) ||
        lowStockThreshold < 0
      )
    ) {
      return NextResponse.json(
        {
          error:
            "El stock mínimo debe ser un número entero mayor o igual a 0",
        },
        { status: 400 }
      );
    }

    const current =
      await prisma.product.findUnique({
        where: { id },
        select: {
          stock: true,
          inStock: true,
        },
      });

    if (!current) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    /*
      Regla:
      - stock 0 => no disponible.
      - si vuelve stock desde 0 => vuelve a disponible.
      - si ya tenía stock y estaba pausado manualmente,
        mantenemos la pausa.
    */
    const nextInStock =
      stock === 0
        ? false
        : current.stock === 0
          ? true
          : current.inStock;

    const product =
      await prisma.product.update({
        where: { id },
        data: {
          stock,
          inStock: nextInStock,
          ...(lowStockThreshold !== undefined
            ? { lowStockThreshold }
            : {}),
        },
      });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
