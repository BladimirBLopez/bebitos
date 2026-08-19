path = "src/app/admin/(panel)/productos/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),'''
new = '''    prisma.product.findMany({ orderBy: { order: "asc" } }),'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: productos ordenados por campo order")
