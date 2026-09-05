import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import PageHeader from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <PageHeader title="Editar producto" meta={product.name} />
      <ProductForm
        initial={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          features: product.features,
          price: String(product.price),
          category: product.category,
          colors: product.colors as { name: string; hex: string }[],
          images: product.images,
          inStock: product.inStock,
          isPromo: product.isPromo,
          isNew: product.isNew,
          promoPrice: product.promoPrice ? String(product.promoPrice) : "",
        }}
      />
    </div>
  );
}