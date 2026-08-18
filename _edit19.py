path = "src/app/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
  });'''

new = '''export default async function Home() {
  const [dbProducts, settings] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''      <Header />'''
new2 = '''      <Header
        whatsapp={settings?.whatsapp}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
      />'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: page.tsx pasa settings al Header")
