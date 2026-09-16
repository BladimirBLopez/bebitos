import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDeleteAccess } from "@/lib/permissions";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireDeleteAccess();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.giftResource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
