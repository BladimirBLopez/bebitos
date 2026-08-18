path = "src/lib/types.ts"
with open(path, "r") as f:
    content = f.read()

old = '''  price: number;
  category: string;'''

new = '''  price: number;
  originalPrice?: number;
  category: string;'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: types.ts actualizado con originalPrice")
