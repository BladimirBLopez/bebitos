import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";
import {
  parseInventoryInput,
  parseProductInput,
} from "@/lib/product-input";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
        lowStockThreshold: true,
        inStock: true,
        price: true,
        isPromo: true,
        promoPrice: true,
        barcode: true,
        cost: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

  const body = await req.json();

  const productResult = parseProductInput(body);

  if (!productResult.ok) {
    return NextResponse.json(
      { error: productResult.error },
      { status: 400 }
    );
  }

  const inventoryResult =
    parseInventoryInput(body);

  if (!inventoryResult.ok) {
    return NextResponse.json(
      { error: inventoryResult.error },
      { status: 400 }
    );
  }

  const data = productResult.value;
  const inventory = inventoryResult.value;

  try {
    const product = await prisma.product.create({
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

        stock: inventory.stock,
        lowStockThreshold:
          inventory.lowStockThreshold,

        inStock:
          inventory.stock > 0 &&
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
