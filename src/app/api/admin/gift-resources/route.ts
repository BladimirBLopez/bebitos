import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateGiftResource } from "@/lib/validation";

export async function GET() {
  const resources = await prisma.giftResource.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const validation = validateGiftResource(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const count = await prisma.giftResource.count();

  const resource = await prisma.giftResource.create({
    data: {
      label: data.label.trim(),
      image: data.image.trim(),
      order: count,
    },
  });

  return NextResponse.json(resource);
}

export async function PUT(req: NextRequest) {
  const { items } = await req.json();

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  await prisma.$transaction(
    items.map((item: { id: string; order: number }) =>
      prisma.giftResource.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );

  return NextResponse.json({ ok: true });
}
