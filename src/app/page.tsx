import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [dbProducts, settings] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  const products = dbProducts.map((p) => ({
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
  }));

  return (
    <div className="flex flex-col flex-1">
      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
      />
      <Hero />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          Nuestros productos
        </h2>
        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">Pronto vas a ver productos aqui.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
