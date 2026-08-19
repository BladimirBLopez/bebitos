path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function ProductsListClient({
  products,
}: {
  products: ProductRow[];
}) {'''

new = '''type Category = { id: string; name: string };

export default function ProductsListClient({
  products,
  allCategories = [],
}: {
  products: ProductRow[];
  allCategories?: Category[];
}) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  const categories = ["Todas", ...Array.from(new Set(products.map((p) => p.category)))];'''
new2 = '''  const categories = ["Todas", ...allCategories.map((c) => c.name)];'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: usa todas las categorias reales")
