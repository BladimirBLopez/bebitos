import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { getContabilidadStats } from "@/lib/accounting";

export async function GET() {
  try {
    const stats = await getContabilidadStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
