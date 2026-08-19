import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CategoryFilter from "@/components/CategoryFilter";
import PromoCarousel from "@/components/PromoCarousel";
import Testimonials from "@/components/Testimonials";
import QualityBadgeBar from "@/components/QualityBadgeBar";
import Footer from "@/components/Footer";
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

  const promoProducts = products.filter((p) => p.originalPrice);
  const heroImage = dbProducts.find((p) => p.images.length > 0)?.images[0];

  return (
    <div className="flex flex-col flex-1">
      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        categories={categories}
      />
      <Hero shippingText={settings?.shippingText} backgroundImage={heroImage} />
      {!q && !categoria && (settings?.showPrices ?? true) && (
        <PromoCarousel products={promoProducts} />
      )}
      <main id="catalogo" className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-10 scroll-mt-20">
        <h2 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          {q ? `Resultados para "${q}"` : "Nuestros productos"}
        </h2>
        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">
            {q ? "No encontramos productos con ese nombre." : "Pronto vas a ver productos aqui."}
          </p>
        ) : (
          <CategoryFilter products={products} initialCategory={categoria} showPrices={settings?.showPrices ?? true} />
        )}
      </main>
      <QualityBadgeBar />
      <Testimonials />
      <Footer
        whatsapp={settings?.whatsapp}
        mapsUrl={settings?.mapsUrl}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        businessHours={settings?.businessHours}
        categories={categories}
      />
      <WhatsAppFloat whatsapp={settings?.whatsapp} />
    </div>
  );
}
