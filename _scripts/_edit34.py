path = "src/components/ProductDetail.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''                  <button
                    onClick={handleAdd}
                    className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                  >
                    {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                  </button>'''

assert content.count(old) == 1, "old no matchea"

new = '''                  {product.inStock === false ? (
                    <span className="bg-ink/10 text-ink/40 font-semibold px-5 py-2.5 rounded-full">
                      Agotado
                    </span>
                  ) : (
                    <button
                      onClick={handleAdd}
                      className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                    >
                      {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                    </button>
                  )}'''

content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - botón desktop cambiado para productos agotados")
