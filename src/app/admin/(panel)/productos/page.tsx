import { prisma } from "@/lib/prisma";
import ProductsListClient from "@/components/ProductsListClient";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <ProductsListClient
      products={products}
      allCategories={categories}
      showPrices={settings?.showPrices ?? true}
    />
  );
}
