import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { getContabilidadStats } from "@/lib/accounting";
import { requireAdminOnly } from "@/lib/permissions";

export async function GET() {
  const user = await requireAdminOnly();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para ver esta sección" }, { status: 403 });
  }

  try {
    const stats = await getContabilidadStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
