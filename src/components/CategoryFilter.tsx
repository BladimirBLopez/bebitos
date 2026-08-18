"use client";

import { useState } from "react";

type Product = { category: string };

export default function CategoryFilter<T extends Product>({
  products,
  children,
}: {
  products: T[];
  children: (filtered: T[]) => React.ReactNode;
}) {
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
      {children(filtered)}
    </div>
  );
}
