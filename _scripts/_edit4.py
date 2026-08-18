path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

new = '''import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <Hero />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-brown-dark mb-6">
          Nuestros productos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
'''

with open(path, "w") as f:
    f.write(new)
print("OK: page.tsx reescrito, largo original:", len(content))
