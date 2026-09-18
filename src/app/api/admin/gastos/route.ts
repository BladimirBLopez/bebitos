import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { validateGasto } from "@/lib/validation";
import { requireAdminOnly } from "@/lib/permissions";

export async function GET() {
  const user = await requireAdminOnly();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  try {
    const gastos = await prisma.gasto.findMany({ orderBy: { date: "desc" } });
    return NextResponse.json(gastos, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAdminOnly();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

  try {
    const data = await req.json();

    const validation = validateGasto(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { concept, category, amount, date, notes } = data as Record<string, string>;

    const gasto = await prisma.gasto.create({
      data: {
        concept: concept.trim(),
        category,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(gasto);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
