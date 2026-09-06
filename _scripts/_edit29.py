path = "src/components/ProductCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old2 = '''          <div className="absolute top-2 left-2 flex flex-col gap-1">
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
          </div>'''
assert content.count(old2) == 1, "old2 no matchea"
new2 = '''          {product.inStock !== false && (
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
          )}'''
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - paso 2 aplicado")
