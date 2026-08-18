import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();

  const settings = await prisma.settings.update({
    where: { id: "singleton" },
    data: {
      whatsapp: data.whatsapp,
      mapsUrl: data.mapsUrl,
      instagramUrl: data.instagramUrl,
      facebookUrl: data.facebookUrl,
      tiktokUrl: data.tiktokUrl,
      shippingText: data.shippingText,
    },
  });

  return NextResponse.json(settings);
}
