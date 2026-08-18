import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!p || !p.inStock) {
    notFound();
  }

  const product = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    features: p.features,
    price: p.isPromo && p.promoPrice ? p.promoPrice : p.price,
    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    category: p.category,
    colors: p.colors as { name: string; hex: string }[],
    images: p.images,
  };

  return (
    <ProductDetail
      product={product}
      settings={{
        whatsapp: settings?.whatsapp,
        instagramUrl: settings?.instagramUrl,
        facebookUrl: settings?.facebookUrl,
        tiktokUrl: settings?.tiktokUrl,
      }}
    />
  );
}
