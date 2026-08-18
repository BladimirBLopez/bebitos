path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    category: p.category,'''

new = '''    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    isNew: p.isNew,
    category: p.category,'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx pasa isNew")
