import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();

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
      promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
    },
  });

  return NextResponse.json(product);
}
