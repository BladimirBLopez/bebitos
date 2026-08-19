path = "src/components/ProductsListClient.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''                  className="opacity-0 group-hover:opacity-100 sm:opacity-100 text-red-300 hover:text-red-500 transition-colors p-1.5 shrink-0"'''
new = '''                  className="text-red-300 hover:text-red-500 transition-colors p-1.5 shrink-0"'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: boton de borrar siempre visible, incluso en movil")
