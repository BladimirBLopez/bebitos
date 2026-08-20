path = "src/app/links/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default async function LinksPage() {
  const [settings, productWithImage] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "singleton" } }),
    prisma.product.findFirst({
      where: { images: { isEmpty: false } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const whatsapp = settings?.whatsapp || "59169501208";
  const mapsUrl = settings?.mapsUrl || "https://maps.app.goo.gl/JrdPzWFLudsLRbFD7";
  const shippingText = settings?.shippingText || "Envios a nivel nacional";
  const backgroundImage = productWithImage?.images[0];'''

new = '''const BACKGROUND_IMAGE = "bebitos/w8jzhkpowpj9eesluoys";

export default async function LinksPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });

  const whatsapp = settings?.whatsapp || "59169501208";
  const mapsUrl = settings?.mapsUrl || "https://maps.app.goo.gl/JrdPzWFLudsLRbFD7";
  const shippingText = settings?.shippingText || "Envios a nivel nacional";
  const backgroundImage = BACKGROUND_IMAGE;'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: pagina de links usa imagen fija en vez de producto mas reciente")
