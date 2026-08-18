path = "src/components/ProductCard.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";'''

new = '''"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

const CLOUD_NAME = "dkq95jus0";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <div className="aspect-square bg-cream flex items-center justify-center text-brown/30 text-sm">
        Foto pendiente
      </div>'''

new2 = '''      <div className="aspect-square bg-cream relative overflow-hidden">
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
        {product.originalPrice && (
          <span className="absolute top-2 left-2 bg-green text-white text-xs font-bold px-2 py-1 rounded-full">
            Oferta
          </span>
        )}
      </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

old3 = '''          <span className="font-display font-semibold text-brown-dark text-lg">
            BOB {product.price}
          </span>'''

new3 = '''          <div>
            {product.originalPrice && (
              <span className="text-xs text-red-400 line-through block">
                BOB {product.originalPrice}
              </span>
            )}
            <span className="font-display font-semibold text-brown-dark text-lg">
              BOB {product.price}
            </span>
          </div>'''

count3 = content.count(old3)
assert count3 == 1, f"Encontrado {count3} veces, se esperaba 1"
content = content.replace(old3, new3)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductCard con fotos reales y precio de oferta")
