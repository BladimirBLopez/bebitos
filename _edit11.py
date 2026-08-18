path = "package.json"
with open(path, "r") as f:
    content = f.read()

old = '''  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },'''

new = '''  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  },'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: package.json con build actualizado")
