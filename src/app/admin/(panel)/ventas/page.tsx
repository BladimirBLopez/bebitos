import { prisma } from "@/lib/prisma";
import VentaForm from "@/components/VentaForm";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage() {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      promoPrice: true,
      isPromo: true,
      stock: true,
      images: true,
    },
  });

  return <VentaForm products={products} />;
}
