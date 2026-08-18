import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-2xl border border-brown/10 overflow-hidden hover:shadow-lg transition-shadow">
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
          <button className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
