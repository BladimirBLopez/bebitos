import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLead } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const validation = validateLead(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  await prisma.lead.create({
    data: {
      name: data.name.trim(),
      whatsapp: data.whatsapp.trim(),
      source: typeof data.source === "string" && data.source.trim() ? data.source.trim() : "regalo",
    },
  });

  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });

  return NextResponse.json({ downloadUrl: settings?.leadMagnetUrl || "" });
}
