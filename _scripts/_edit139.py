path = "src/app/admin/(panel)/productos/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default async function AdminProductosPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <ProductsListClient products={products} allCategories={categories} />;
}'''

new = '''export default async function AdminProductosPage() {
  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <ProductsListClient
      products={products}
      allCategories={categories}
      showPrices={settings?.showPrices ?? true}
    />
  );
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: showPrices pasado a la lista de productos")
