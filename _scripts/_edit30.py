path = "src/components/ProductCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old3 = '''                <div>
                  {product.originalPrice && (
                    <span className="text-xs text-red-400 line-through block">
                      BOB {product.originalPrice}
                    </span>
                  )}
                  <span className="font-display font-bold text-green-dark text-lg">
                    BOB {product.price}
                  </span>
                </div>
                <button
                  onClick={handleAdd}
                  className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm shadow-green/30 transition-colors"
                >
                  Agregar
                </button>'''
assert content.count(old3) == 1, "old3 no matchea"
new3 = '''                <div>
                  {product.originalPrice && (
                    <span className="text-xs text-red-400 line-through block">
                      BOB {product.originalPrice}
                    </span>
                  )}
                  <span
                    className={`font-display font-bold text-lg ${
                      product.inStock === false ? "text-ink/30" : "text-green-dark"
                    }`}
                  >
                    BOB {product.price}
                  </span>
                </div>
                {product.inStock === false ? (
                  <span className="bg-ink/10 text-ink/40 text-sm font-semibold px-3 py-1.5 rounded-full">
                    Agotado
                  </span>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="bg-green hover:bg-green-dark text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm shadow-green/30 transition-colors"
                  >
                    Agregar
                  </button>
                )}'''
content = content.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - paso 3 aplicado")
