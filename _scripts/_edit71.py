path = "src/components/CategoryFilter.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function CategoryFilter({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory?: string;
}) {'''

new = '''export default function CategoryFilter({
  products,
  initialCategory,
  showPrices = true,
}: {
  products: Product[];
  initialCategory?: string;
  showPrices?: boolean;
}) {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''          <ProductCard key={product.id} product={product} />'''
new2 = '''          <ProductCard key={product.id} product={product} showPrices={showPrices} />'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: CategoryFilter pasa showPrices")
