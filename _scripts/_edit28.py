path = "src/components/ProductCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Overlay oscuro con "Agotado" sobre la imagen
old1 = '''          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg tracking-wide">
                Agotado
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">'''
content = content.replace(old1, new1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - paso 1 aplicado")
