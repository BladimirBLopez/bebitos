import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json(
      { whatsapp: settings?.whatsapp || "" },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch {
    return NextResponse.json({ whatsapp: "" }, { status: 200 });
  }
}
