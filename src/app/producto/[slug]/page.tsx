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
  const [p, settings, categories] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
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
    isNew: p.isNew,
    category: p.category,
    colors: p.colors as { name: string; hex: string }[],
    images: p.images,
  };

  const relatedRaw = await prisma.product.findMany({
    where: { category: p.category, inStock: true, id: { not: p.id } },
    take: 4,
  });

  const related = relatedRaw.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    features: r.features,
    price: r.isPromo && r.promoPrice ? r.promoPrice : r.price,
    originalPrice: r.isPromo && r.promoPrice ? r.price : undefined,
    isNew: r.isNew,
    category: r.category,
    colors: r.colors as { name: string; hex: string }[],
    images: r.images,
  }));

  return (
    <ProductDetail
      product={product}
      related={related}
      settings={{
        whatsapp: settings?.whatsapp,
        instagramUrl: settings?.instagramUrl,
        facebookUrl: settings?.facebookUrl,
        tiktokUrl: settings?.tiktokUrl,
      }}
      categories={categories}
    />
  );
}
