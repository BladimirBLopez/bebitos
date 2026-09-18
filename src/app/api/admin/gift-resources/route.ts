import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateGiftResource } from "@/lib/validation";
import { requireAdminOnly } from "@/lib/permissions";

export async function GET() {
  const user = await requireAdminOnly();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para ver esta sección" },
      { status: 403 }
    );
  }

  try {
    const resources = await prisma.giftResource.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(resources, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron cargar los recursos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAdminOnly();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  try {
    const data = await req.json();

    const validation = validateGiftResource(data);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const count = await prisma.giftResource.count();

    const resource = await prisma.giftResource.create({
      data: {
        label: data.label.trim(),
        image: data.image.trim(),
        order: count,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear el recurso" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireAdminOnly();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Formato inválido" },
        { status: 400 }
      );
    }

    const cleanItems = items.map((item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.id !== "string" ||
        !item.id
      ) {
        throw new Error("Recurso inválido");
      }

      return {
        id: item.id,
        order: index,
      };
    });

    await prisma.$transaction(
      cleanItems.map((item) =>
        prisma.giftResource.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Recurso inválido"
        ? error.message
        : "No se pudo guardar el orden";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
