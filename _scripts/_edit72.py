path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''          <CategoryFilter products={products} initialCategory={categoria} />'''
new = '''          <CategoryFilter products={products} initialCategory={categoria} showPrices={settings?.showPrices ?? true} />'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx pasa showPrices")
