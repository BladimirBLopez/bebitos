import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireReadAccess } from "@/lib/permissions";

export async function GET() {
  const user = await requireReadAccess();

  if (!user) {
    return NextResponse.json(
      { error: "Sesión no válida o usuario inactivo" },
      { status: 401 }
    );
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(leads);
}
