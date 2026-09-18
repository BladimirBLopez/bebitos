import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/permissions";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdminOnly();

  if (!user) {
    return NextResponse.json(
      { error: "No tienes permiso para esta acción" },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const resource = await prisma.giftResource.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Recurso no encontrado" },
        { status: 404 }
      );
    }

    await prisma.giftResource.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo eliminar el recurso" },
      { status: 500 }
    );
  }
}
