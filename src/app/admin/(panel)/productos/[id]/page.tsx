import { notFound } from "next/navigation";

import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product =
    await prisma.product.findUnique({
      where: { id },
    });

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initial={{
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        features: product.features,

        price: String(product.price),
        cost:
          product.cost !== null
            ? String(product.cost)
            : "",

        category: product.category,

        colors:
          product.colors as {
            name: string;
            hex: string;
          }[],

        images: product.images,

        stock: String(product.stock),
        lowStockThreshold: String(
          product.lowStockThreshold
        ),

        inStock: product.inStock,
        isPromo: product.isPromo,
        isNew: product.isNew,

        promoPrice:
          product.promoPrice !== null
            ? String(product.promoPrice)
            : "",

        barcode: product.barcode || "",
      }}
    />
  );
}
