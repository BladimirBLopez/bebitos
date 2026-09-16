import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCategoryName } from "@/lib/validation";
import { requireWriteAccess } from "@/lib/permissions";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

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
  const user = await requireWriteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

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
}
