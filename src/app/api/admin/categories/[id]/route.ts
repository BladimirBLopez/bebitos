import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCategoryName } from "@/lib/validation";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await req.json();

  const validation = validateCategoryName(name);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  const newName = name.trim();

  try {
    const [category] = await prisma.$transaction([
      prisma.category.update({ where: { id }, data: { name: newName } }),
      prisma.product.updateMany({
        where: { category: existing.name },
        data: { category: newName },
      }),
    ]);
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
