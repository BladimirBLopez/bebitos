path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function ProductsListClient({
  products,
  allCategories = [],
}: {
  products: ProductRow[];
  allCategories?: Category[];
}) {'''

new = '''export default function ProductsListClient({
  products,
  allCategories = [],
  showPrices = true,
}: {
  products: ProductRow[];
  allCategories?: Category[];
  showPrices?: boolean;
}) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''                <div className="text-right shrink-0">
                  {p.isPromo && p.promoPrice ? (
                    <div>
                      <span className="text-xs text-red-400 line-through block">
                        BOB {p.price}
                      </span>
                      <span className="font-semibold text-green">
                        BOB {p.promoPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-brown-dark">
                      BOB {p.price}
                    </span>
                  )}
                </div>'''

new2 = '''                {showPrices && (
                  <div className="text-right shrink-0">
                    {p.isPromo && p.promoPrice ? (
                      <div>
                        <span className="text-xs text-red-400 line-through block">
                          BOB {p.price}
                        </span>
                        <span className="font-semibold text-green">
                          BOB {p.promoPrice}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-brown-dark">
                        BOB {p.price}
                      </span>
                    )}
                  </div>
                )}'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: precio oculto en lista del panel cuando showPrices esta desactivado")
