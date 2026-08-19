import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

const CLOUD_NAME = "dkq95jus0";

export default function PromoCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-cream pt-5 pb-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-display text-lg font-semibold text-brown-dark">
            Ofertas de la semana
          </h2>
          <span className="bg-green text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            🔥 Promo
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/producto/${p.slug}`}
              className="flex-none w-40 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-cream relative">
                {p.images && p.images.length > 0 ? (
                  <Image
                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_300,h_300,c_fill/${p.images[0]}`}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brown/30 text-xs">
                    Foto pendiente
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Oferta
                </span>
              </div>
              <div className="p-2.5">
                <p className="text-sm font-medium text-ink truncate mb-1">{p.name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-red-400 line-through">
                    BOB {p.originalPrice}
                  </span>
                  <span className="font-display font-semibold text-brown-dark text-sm">
                    BOB {p.price}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
