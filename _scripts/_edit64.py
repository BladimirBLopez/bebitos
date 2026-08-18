path = "prisma/schema.prisma"
with open(path, "r") as f:
    content = f.read()

old = '''  shippingText  String  @default("Envios a nivel nacional")
  businessHours String  @default("")
  updatedAt     DateTime @updatedAt
}'''

new = '''  shippingText  String  @default("Envios a nivel nacional")
  businessHours String  @default("")
  showPrices    Boolean  @default(true)
  updatedAt     DateTime @updatedAt
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: schema con showPrices")
