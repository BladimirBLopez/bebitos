path = "src/app/producto/[slug]/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });

  if (!p || !p.inStock) {
    notFound();
  }'''

new = '''  const { slug } = await params;
  const [p, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!p || !p.inStock) {
    notFound();
  }'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''  return <ProductDetail product={product} />;'''
new2 = '''  return (
    <ProductDetail
      product={product}
      settings={{
        whatsapp: settings?.whatsapp,
        instagramUrl: settings?.instagramUrl,
        facebookUrl: settings?.facebookUrl,
        tiktokUrl: settings?.tiktokUrl,
      }}
    />
  );'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: pagina de producto pasa settings")
