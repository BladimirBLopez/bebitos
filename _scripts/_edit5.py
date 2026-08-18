path = "src/components/ProductCard.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-2xl border border-brown/10 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-cream flex items-center justify-center text-brown/30 text-sm">
        Foto pendiente
      </div>
      <div className="p-4">'''

new = '''import Link from "next/link";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/producto/${product.slug}`}
      className="block bg-white rounded-2xl border border-brown/10 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-cream flex items-center justify-center text-brown/30 text-sm">
        Foto pendiente
      </div>
      <div className="p-4">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old_close = '''          <button className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}'''

new_close = '''          <span className="bg-green text-white text-sm font-semibold px-3 py-1.5 rounded-full">
            Ver más
          </span>
        </div>
      </div>
    </Link>
  );
}'''

count2 = content.count(old_close)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old_close, new_close)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductCard.tsx actualizado")
