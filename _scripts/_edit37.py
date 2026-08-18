path = "src/components/RelatedProducts.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    <section className="max-w-6xl mx-auto px-4 py-10">'''
new = '''    <section className="max-w-6xl mx-auto px-4 pt-10 pb-24 sm:pb-10">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: espacio extra abajo en RelatedProducts para el boton sticky")
