path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import CategoryFilter from "@/components/CategoryFilter";
import Testimonials from "@/components/Testimonials";'''
new = '''import CategoryFilter from "@/components/CategoryFilter";
import PromoCarousel from "@/components/PromoCarousel";
import Testimonials from "@/components/Testimonials";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  const products = dbProducts.map((p) => ({
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
  }));'''

new2 = '''  const products = dbProducts.map((p) => ({
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
  const heroImage = dbProducts.find((p) => p.images.length > 0)?.images[0];'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''      <TrustBar shippingText={settings?.shippingText} />
      <Hero />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          {q ? `Resultados para "${q}"` : "Nuestros productos"}
        </h2>'''

new3 = '''      <TrustBar shippingText={settings?.shippingText} />
      <Hero shippingText={settings?.shippingText} backgroundImage={heroImage} />
      {!q && !categoria && (settings?.showPrices ?? true) && (
        <PromoCarousel products={promoProducts} />
      )}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-10">
        <h2 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          {q ? `Resultados para "${q}"` : "Nuestros productos"}
        </h2>'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx con hero de fondo, promociones pegadas, menos espacio")
