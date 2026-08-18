"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";

export default function CategoryFilter({ products }: { products: Product[] }) {
  const [active, setActive] = useState("Todas");
  const categories = ["Todas", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = active === "Todas" ? products : products.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              active === c
                ? "bg-brown-dark text-cream"
                : "bg-white text-ink/60 border border-brown/15 hover:border-brown/30"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
