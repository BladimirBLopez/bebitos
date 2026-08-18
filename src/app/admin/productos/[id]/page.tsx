import { notFound } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import ProductForm from "@/components/ProductForm";
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
    <div className="min-h-screen bg-cream">
      <AdminHeader />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          Editar producto
        </h1>
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
            promoPrice: product.promoPrice ? String(product.promoPrice) : "",
          }}
        />
      </main>
    </div>
  );
}
