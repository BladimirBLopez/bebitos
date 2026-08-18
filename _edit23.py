path = "prisma/schema.prisma"
with open(path, "r") as f:
    content = f.read()

old_product = '''  category    String
  colors      Json
  images      String[]
  inStock     Boolean  @default(true)
  isPromo     Boolean  @default(false)
  promoPrice  Float?'''

new_product = '''  category    String
  colors      Json
  images      String[]
  inStock     Boolean  @default(true)
  isPromo     Boolean  @default(false)
  promoPrice  Float?
  isNew       Boolean  @default(false)'''

assert content.count(old_product) == 1
content = content.replace(old_product, new_product)

old_settings = '''  shippingText  String  @default("Envios a nivel nacional")
  updatedAt     DateTime @updatedAt
}'''

new_settings = '''  shippingText  String  @default("Envios a nivel nacional")
  businessHours String  @default("")
  updatedAt     DateTime @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
}'''

assert content.count(old_settings) == 1
content = content.replace(old_settings, new_settings)

with open(path, "w") as f:
    f.write(content)
print("OK: schema actualizado con isNew, businessHours y Category")
