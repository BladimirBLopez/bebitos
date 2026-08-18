path = "src/components/ProductCard.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        {product.originalPrice && (
          <span className="absolute top-2 left-2 bg-green text-white text-xs font-bold px-2 py-1 rounded-full">
            Oferta
          </span>
        )}'''

new = '''        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.originalPrice && (
            <span className="bg-green text-white text-xs font-bold px-2 py-1 rounded-full w-fit">
              Oferta
            </span>
          )}
          {product.isNew && !product.originalPrice && (
            <span className="bg-brown-dark text-cream text-xs font-bold px-2 py-1 rounded-full w-fit">
              Nuevo
            </span>
          )}
        </div>'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: ProductCard con badge Nuevo")
