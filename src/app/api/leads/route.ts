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
      babyAge: data.babyAge,
      source: typeof data.source === "string" && data.source.trim() ? data.source.trim() : "regalo",
    },
  });

  return NextResponse.json({ ok: true });
}
