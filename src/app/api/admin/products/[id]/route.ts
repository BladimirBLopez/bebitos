import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateProduct } from "@/lib/validation";
import { requireWriteAccess, requireDeleteAccess } from "@/lib/permissions";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  const { id } = await params;
  const data = await req.json();

  const validation = validateProduct(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        features: data.features,
        price: parseFloat(data.price),
        category: data.category,
        colors: data.colors,
        images: data.images,
        inStock: data.inStock,
        isPromo: data.isPromo,
        isNew: data.isNew || false,
        promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
        barcode: data.barcode && data.barcode.trim() ? data.barcode.trim() : null,
        cost: data.cost !== undefined && data.cost !== null && data.cost !== "" ? parseFloat(data.cost) : null,
      },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Ese código de barras ya está en uso por otro producto" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireDeleteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
