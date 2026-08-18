import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="font-display text-xl font-semibold text-brown-dark mb-5">
        También te puede interesar
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
