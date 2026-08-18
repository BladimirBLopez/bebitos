import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import CategoryFilter from "@/components/CategoryFilter";
import Testimonials from "@/components/Testimonials";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q, categoria } = await searchParams;

  const [dbProducts, settings, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        inStock: true,
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = dbProducts.map((p) => ({
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
  }));

  return (
    <div className="flex flex-col flex-1">
      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        categories={categories}
      />
      <TrustBar shippingText={settings?.shippingText} />
      <Hero />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          {q ? `Resultados para "${q}"` : "Nuestros productos"}
        </h2>
        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">
            {q ? "No encontramos productos con ese nombre." : "Pronto vas a ver productos aqui."}
          </p>
        ) : (
          <CategoryFilter products={products} initialCategory={categoria} />
        )}
      </main>
      <Testimonials />
    </div>
  );
}
