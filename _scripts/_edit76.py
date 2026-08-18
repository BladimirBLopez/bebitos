path = "src/components/ProductDetail.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''              {showPrices ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-semibold text-brown-dark text-2xl">
                      BOB {product.price}
                    </span>
                    <button
                      onClick={handleAdd}
                      className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                    >
                      {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                    </button>
                  </div>
                  <a
                    href={`https://wa.me/${settings?.whatsapp || "59169501208"}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre: ${product.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-brown-dark/70 hover:text-brown-dark border border-brown/15 hover:border-brown/30 py-2 rounded-full transition-colors"
                  >
                    ¿Tienes dudas? Consulta por WhatsApp
                  </a>
                </>
              ) : ('''

new = '''              {showPrices ? (
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-brown-dark text-2xl">
                    BOB {product.price}
                  </span>
                  <button
                    onClick={handleAdd}
                    className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
                  >
                    {added ? "¡Agregado! ✓" : "Agregar al carrito"}
                  </button>
                </div>
              ) : ('''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: quitado link redundante de consulta cuando precios activos")
