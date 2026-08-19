path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''                className={`bg-white rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition-shadow group ${'''

new = '''                className={`bg-white rounded-xl p-3 flex items-center gap-3 transition-shadow group ${'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

with open(path, "w") as f:
    f.write(content)
print("OK: paso 1 completado")
