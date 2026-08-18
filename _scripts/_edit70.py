path = "src/components/ProductCard.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function ProductCard({ product }: { product: Product }) {'''
new = '''export default function ProductCard({
  product,
  showPrices = true,
}: {
  product: Product;
  showPrices?: boolean;
}) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-red-400 line-through block">
                BOB {product.originalPrice}
              </span>
            )}
            <span className="font-display font-semibold text-brown-dark text-lg">
              BOB {product.price}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Agregar
          </button>
        </div>'''

new2 = '''        <div className="flex items-center justify-between">
          {showPrices ? (
            <>
              <div>
                {product.originalPrice && (
                  <span className="text-xs text-red-400 line-through block">
                    BOB {product.originalPrice}
                  </span>
                )}
                <span className="font-display font-semibold text-brown-dark text-lg">
                  BOB {product.price}
                </span>
              </div>
              <button
                onClick={handleAdd}
                className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
              >
                Agregar
              </button>
            </>
          ) : (
            <span className="bg-brown-dark text-cream text-sm font-semibold px-3 py-1.5 rounded-full w-full text-center">
              Consultar precio
            </span>
          )}
        </div>'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: ProductCard con soporte showPrices")
