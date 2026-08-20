"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

const CLOUD_NAME = "dkq95jus0";

export default function ProductCard({
  product,
  showPrices = true,
}: {
  product: Product;
  showPrices?: boolean;
}) {
  const { addItem } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0]?.name);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Link
        href={`/producto/${product.slug}`}
        className="flex flex-col h-full bg-white rounded-2xl border border-brown/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-brown/20 transition-shadow"
      >
        <div className="aspect-square bg-cream relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_400,c_fill/${product.images[0]}`}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brown/30 text-sm">
              Foto pendiente
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.originalPrice && (
              <span className="bg-green text-white text-xs font-bold px-2 py-1 rounded-full w-fit shadow-sm">
                Oferta
              </span>
            )}
            {product.isNew && !product.originalPrice && (
              <span className="bg-brown-dark text-cream text-xs font-bold px-2 py-1 rounded-full w-fit shadow-sm">
                Nuevo
              </span>
            )}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-display font-medium text-ink text-base mb-1 line-clamp-2">
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
          <div className="flex items-center justify-between mt-auto">
            {showPrices ? (
              <>
                <div>
                  {product.originalPrice && (
                    <span className="text-xs text-red-400 line-through block">
                      BOB {product.originalPrice}
                    </span>
                  )}
                  <span className="font-display font-bold text-green-dark text-lg">
                    BOB {product.price}
                  </span>
                </div>
                <button
                  onClick={handleAdd}
                  className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm shadow-green/30 transition-colors"
                >
                  Agregar
                </button>
              </>
            ) : (
              <span className="bg-brown-dark text-cream text-sm font-semibold px-3 py-1.5 rounded-full w-full text-center">
                Consultar precio
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
