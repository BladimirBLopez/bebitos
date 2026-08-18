path = "prisma/schema.prisma"
with open(path, "r") as f:
    content = f.read()

addition = '''

model Settings {
  id            String  @id @default("singleton")
  whatsapp      String
  mapsUrl       String
  instagramUrl  String
  facebookUrl   String
  tiktokUrl     String
  shippingText  String  @default("Envios a nivel nacional")
  updatedAt     DateTime @updatedAt
}
'''

if "model Settings" not in content:
    content = content.rstrip() + "\n" + addition
    with open(path, "w") as f:
        f.write(content)
    print("OK: modelo Settings agregado")
else:
    print("Ya existia el modelo Settings, no se toco nada")
