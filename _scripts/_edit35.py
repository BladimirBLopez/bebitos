path = "src/app/producto/[slug]/page.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''  const { slug } = await params;
  const [p, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!p || !p.inStock) {
    notFound();
  }

  const product = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    features: p.features,
    price: p.isPromo && p.promoPrice ? p.promoPrice : p.price,
    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    category: p.category,
    colors: p.colors as { name: string; hex: string }[],
    images: p.images,
  };'''

new = '''  const { slug } = await params;
  const [p, settings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.settings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!p || !p.inStock) {
    notFound();
  }

  const product = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    features: p.features,
    price: p.isPromo && p.promoPrice ? p.promoPrice : p.price,
    originalPrice: p.isPromo && p.promoPrice ? p.price : undefined,
    isNew: p.isNew,
    category: p.category,
    colors: p.colors as { name: string; hex: string }[],
    images: p.images,
  };

  const relatedRaw = await prisma.product.findMany({
    where: { category: p.category, inStock: true, id: { not: p.id } },
    take: 4,
  });

  const related = relatedRaw.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    features: r.features,
    price: r.isPromo && r.promoPrice ? r.promoPrice : r.price,
    originalPrice: r.isPromo && r.promoPrice ? r.price : undefined,
    isNew: r.isNew,
    category: r.category,
    colors: r.colors as { name: string; hex: string }[],
    images: r.images,
  }));'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''    <ProductDetail
      product={product}
      settings={{'''
new2 = '''    <ProductDetail
      product={product}
      related={related}
      settings={{'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: pagina de producto trae relacionados")
