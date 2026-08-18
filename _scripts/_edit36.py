path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">Pronto vas a ver productos aqui.</p>
        ) : (
          <CategoryFilter products={products}>
            {(filtered) => (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </CategoryFilter>
        )}'''

new = '''        {products.length === 0 ? (
          <p className="text-ink/50 text-sm">Pronto vas a ver productos aqui.</p>
        ) : (
          <CategoryFilter products={products} />
        )}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''import CategoryFilter from "@/components/CategoryFilter";
import Testimonials from "@/components/Testimonials";
import ProductCard from "@/components/ProductCard";'''
new2 = '''import CategoryFilter from "@/components/CategoryFilter";
import Testimonials from "@/components/Testimonials";'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx simplificado, sin patron de children funcion")
