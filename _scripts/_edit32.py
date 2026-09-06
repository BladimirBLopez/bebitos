path = "src/components/ProductDetail.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''              ) : (
                <div className="w-full h-full flex items-center justify-center text-brown/30">
                  Foto pendiente
                </div>
              )}
            </div>'''

assert content.count(old) == 1, "old no matchea"

new = '''              ) : (
                <div className="w-full h-full flex items-center justify-center text-brown/30">
                  Foto pendiente
                </div>
              )}
              {product.inStock === false && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-2xl tracking-wide">
                    Agotado
                  </span>
                </div>
              )}
            </div>'''

content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - overlay de Agotado agregado en ProductDetail")
