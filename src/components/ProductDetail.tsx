"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import RelatedProducts from "@/components/RelatedProducts";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

const CLOUD_NAME = "dkq95jus0";

type Settings = {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
};

export default function ProductDetail({
  product,
  settings,
  related = [],
}: {
  product: Product;
  settings?: Settings;
  related?: Product[];
}) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
      />
      <main className="max-w-6xl w-full mx-auto px-4 py-8 pb-24 sm:pb-8">
        <Link
          href="/"
          className="text-sm text-brown-dark/70 hover:text-brown-dark inline-block mb-6"
        >
          ← Volver al catálogo
        </Link>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="aspect-square bg-cream rounded-2xl relative overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800,h_800,c_fill/${product.images[0]}`}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brown/30">
                Foto pendiente
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-brown/60 uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h1 className="font-display text-3xl font-semibold text-ink mb-3">
              {product.name}
            </h1>
            <p className="text-ink/70 mb-5">{product.description}</p>

            {product.features.length > 0 && (
              <ul className="mb-5 space-y-1.5">
                {product.features.map((f) => (
                  <li key={f} className="text-sm text-ink/70 flex items-start gap-2">
                    <span className="text-green mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-ink mb-2">
                  Color: <span className="font-normal text-ink/60">{selectedColor}</span>
                </p>
                <div className="flex items-center gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`w-7 h-7 rounded-full border-2 shadow ring-1 transition-all ${
                        selectedColor === c.name
                          ? "ring-2 ring-brown-dark scale-110"
                          : "ring-black/10"
                      }`}
                      style={{ backgroundColor: c.hex, borderColor: "white" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Botón normal en desktop, se oculta en móvil (ahí usamos el sticky de abajo) */}
            <div className="hidden sm:flex items-center justify-between border-t border-brown/10 pt-5">
              <span className="font-display font-semibold text-brown-dark text-2xl">
                BOB {product.price}
              </span>
              <button
                onClick={handleAdd}
                className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                {added ? "¡Agregado! ✓" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <RelatedProducts products={related} />

      {/* Barra sticky solo en móvil */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-brown/10 px-4 py-3 flex items-center justify-between gap-3 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <span className="font-display font-semibold text-brown-dark text-xl shrink-0">
          BOB {product.price}
        </span>
        <button
          onClick={handleAdd}
          className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
        >
          {added ? "¡Agregado! ✓" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
