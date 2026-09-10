import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { validateProduct } from "@/lib/validation";

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
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const validation = validateProduct(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

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
    },
  });

  return NextResponse.json(product);
}
