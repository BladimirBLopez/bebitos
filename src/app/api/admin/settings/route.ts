import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSettings } from "@/lib/validation";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();

  const validation = validateSettings(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const settings = await prisma.settings.update({
    where: { id: "singleton" },
    data: {
      whatsapp: data.whatsapp,
      mapsUrl: data.mapsUrl,
      instagramUrl: data.instagramUrl,
      facebookUrl: data.facebookUrl,
      tiktokUrl: data.tiktokUrl,
      shippingText: data.shippingText,
      businessHours: data.businessHours,
      showPrices: data.showPrices,
    },
  });

  return NextResponse.json(settings);
}
