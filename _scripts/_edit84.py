path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-10">'''
new = '''      <main id="catalogo" className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-10 scroll-mt-20">'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: id catalogo agregado, con scroll-mt para el header sticky")
