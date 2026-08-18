import { prisma } from "@/lib/prisma";
import ProductsListClient from "@/components/ProductsListClient";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ProductsListClient products={products} />;
}
