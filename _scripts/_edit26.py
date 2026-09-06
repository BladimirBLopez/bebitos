path = "src/app/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Quitar el filtro inStock: true de la query (para que traiga tambien los agotados)
old1 = '''    prisma.product.findMany({
      where: {
        inStock: true,
        ...(q'''
assert content.count(old1) == 1, "old1 no matchea"
new1 = '''    prisma.product.findMany({
      where: {
        ...(q'''
content = content.replace(old1, new1)

# 2. Agregar inStock al mapeo de productos
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

print("OK - 2 reemplazos aplicados en page.tsx")
