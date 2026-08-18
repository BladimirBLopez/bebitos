path = "src/components/ProductCard.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''import Link from "next/link";
import { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {'''

new = '''"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0]?.name);
  }'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''          <span className="bg-green text-white text-sm font-semibold px-3 py-1.5 rounded-full">
            Ver más
          </span>'''

new2 = '''          <button
            onClick={handleAdd}
            className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Agregar
          </button>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductCard.tsx con boton Agregar funcional")
