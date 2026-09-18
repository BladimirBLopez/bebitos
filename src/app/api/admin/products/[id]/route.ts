import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireDeleteAccess,
  requireWriteAccess,
} from "@/lib/permissions";
import { parseProductInput } from "@/lib/product-input";

export async function PUT(
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

  const { id } = await params;
  const body = await req.json();

  const parsed = parseProductInput(body);

  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: 400 }
    );
  }

  const data = parsed.value;

  try {
    /*
      El stock NO se sobrescribe desde esta ruta.
      Se administra desde Inventario para evitar
      pisar cantidades por accidente al editar
      nombre, fotos, descripción, etc.
    */
    const current =
      await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          stock: true,
        },
      });

    if (!current) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        features: data.features,
        price: data.price,
        cost: data.cost,
        category: data.category,
        colors: data.colors,
        images: data.images,

        inStock:
          current.stock > 0 &&
          data.inStock,

        isPromo: data.isPromo,
        promoPrice: data.promoPrice,
        isNew: data.isNew,
        barcode: data.barcode,
      },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Ya existe otro producto con ese identificador o código de barras",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const user = await requireDeleteAccess();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "No tienes permiso para esta acción",
      },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo borrar el producto" },
      { status: 400 }
    );
  }
}
