import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

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
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
