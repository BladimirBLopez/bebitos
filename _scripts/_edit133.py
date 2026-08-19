path = "src/app/api/admin/categories/route.ts"
with open(path, "r") as f:
    content = f.read()

old = '''export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  const validation = validateCategoryName(name);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({ data: { name: name.trim() } });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Esa categoría ya existe" }, { status: 400 });
  }
}'''

new = '''export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  const validation = validateCategoryName(name);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? 0) + 1;
    const category = await prisma.category.create({
      data: { name: name.trim(), order: nextOrder },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Esa categoría ya existe" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const { items } = await req.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((item: { id: string; order: number }) =>
      prisma.category.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );

  return NextResponse.json({ ok: true });
}'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: API con orden y endpoint de reordenar")
