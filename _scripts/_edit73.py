path = "src/components/RelatedProducts.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;'''

new = '''export default function RelatedProducts({
  products,
  showPrices = true,
}: {
  products: Product[];
  showPrices?: boolean;
}) {
  if (products.length === 0) return null;'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''          <ProductCard key={p.id} product={p} />'''
new2 = '''          <ProductCard key={p.id} product={p} showPrices={showPrices} />'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: RelatedProducts con showPrices")
