"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0]?.name);
  }
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="block bg-white rounded-2xl border border-brown/10 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-cream flex items-center justify-center text-brown/30 text-sm">
        Foto pendiente
      </div>
      <div className="p-4">
        <h3 className="font-display font-medium text-ink text-base mb-1">
          {product.name}
        </h3>
        <p className="text-ink/60 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-1.5 mb-3">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="w-4 h-4 rounded-full border border-black/10"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-brown-dark text-lg">
            BOB {product.price}
          </span>
          <button
            onClick={handleAdd}
            className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </Link>
  );
}
