path = "src/components/ProductDetail.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''            <span className="font-display font-semibold text-brown-dark text-xl shrink-0">
              BOB {product.price}
            </span>
            <button
              onClick={handleAdd}
              className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
            >
              {added ? "¡Agregado! ✓" : "Agregar al carrito"}
            </button>'''

assert content.count(old) == 1, "old no matchea"

new = '''            <span
              className={`font-display font-semibold text-xl shrink-0 ${
                product.inStock === false ? "text-ink/30" : "text-brown-dark"
              }`}
            >
              BOB {product.price}
            </span>
            {product.inStock === false ? (
              <span className="flex-1 bg-ink/10 text-ink/40 text-center font-semibold py-2.5 rounded-full">
                Agotado
              </span>
            ) : (
              <button
                onClick={handleAdd}
                className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-2.5 rounded-full transition-colors"
              >
                {added ? "¡Agregado! ✓" : "Agregar al carrito"}
              </button>
            )}'''

content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - precio y botón móvil cambiados para productos agotados")
