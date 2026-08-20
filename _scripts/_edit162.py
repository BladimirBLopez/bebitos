path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  const heroImage = dbProducts.find((p) => p.images.length > 0)?.images[0];'''
new = '''  const heroImage = "bebitos/w8jzhkpowpj9eesluoys";'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: hero de la tienda usa imagen fija")
