path = "src/app/producto/[slug]/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Ya no ocultar el producto agotado (solo si no existe)
old1 = '''  if (!p || !p.inStock) {
    notFound();
  }'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''  if (!p) {
    notFound();
  }'''
content = content.replace(old1, new1)

# 2. Agregar inStock al mapeo del producto principal
old2 = '''    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    isNew: p.isNew,
    category: p.category,'''
assert content.count(old2) == 1, "old2 no matchea"
new2 = '''    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    isNew: p.isNew,
    inStock: p.inStock,
    category: p.category,'''
content = content.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK - 2 reemplazos aplicados en producto/[slug]/page.tsx")
