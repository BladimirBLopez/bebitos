path = "src/lib/types.ts"
with open(path, "r") as f:
    content = f.read()

old = '''  originalPrice?: number;
  category: string;'''

new = '''  originalPrice?: number;
  isNew?: boolean;
  category: string;'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: types.ts con isNew")
