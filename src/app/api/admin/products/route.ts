import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { validateProduct } from "@/lib/validation";
import { requireWriteAccess } from "@/lib/permissions";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
        inStock: true,
        price: true,
        isPromo: true,
        promoPrice: true,
        barcode: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  const data = await req.json();

  const validation = validateProduct(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
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
