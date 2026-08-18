import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetail from "@/components/ProductDetail";

export const dynamic = "force-dynamic";

const CLOUD_NAME = "dkq95jus0";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });

  if (!p) {
    return { title: "Producto no encontrado | Bebitos" };
  }

  const price = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
  const title = `${p.name} - BOB ${price} | Bebitos`;
  const description = p.description;
  const image =
    p.images && p.images.length > 0
      ? `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_630,c_fill/${p.images[0]}`
      : "https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: p.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

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
        mapsUrl: settings?.mapsUrl,
        instagramUrl: settings?.instagramUrl,
        facebookUrl: settings?.facebookUrl,
        tiktokUrl: settings?.tiktokUrl,
        businessHours: settings?.businessHours,
      }}
      categories={categories}
    />
  );
}
