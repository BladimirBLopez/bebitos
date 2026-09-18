import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/permissions";

type ReorderItem = {
  id: string;
  order: number;
};

export async function PUT(req: NextRequest) {
  const user = await requireWriteAccess();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const items = body?.items;

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 500
  ) {
    return NextResponse.json(
      { error: "Formato inválido" },
      { status: 400 }
    );
  }

  const parsed: ReorderItem[] = [];

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.id !== "string" ||
      !item.id.trim() ||
      !Number.isInteger(item.order) ||
      item.order < 0
    ) {
      return NextResponse.json(
        { error: "Orden inválido" },
        { status: 400 }
      );
    }

    parsed.push({
      id: item.id,
      order: item.order,
    });
  }

  const uniqueIds = new Set(parsed.map((item) => item.id));

  if (uniqueIds.size !== parsed.length) {
    return NextResponse.json(
      { error: "Hay productos repetidos" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(
      parsed.map((item) =>
        prisma.product.update({
          where: {
            id: item.id,
          },
          data: {
            order: item.order,
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el orden" },
      { status: 500 }
    );
  }
}
