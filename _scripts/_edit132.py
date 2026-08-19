path = "prisma/schema.prisma"
with open(path, "r") as f:
    content = f.read()

old = '''model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
}'''

new = '''model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  order     Int      @default(0)
  createdAt DateTime @default(now())
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: campo order agregado al schema")
