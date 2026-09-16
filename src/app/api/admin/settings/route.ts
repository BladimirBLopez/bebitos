import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSettings } from "@/lib/validation";
import { requireAdminOnly } from "@/lib/permissions";

export async function GET() {
  const user = await requireAdminOnly();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para ver esta sección" }, { status: 403 });
  }

  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const user = await requireAdminOnly();
  if (!user) {
    return NextResponse.json({ error: "No tienes permiso para esta acción" }, { status: 403 });
  }

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
      qualityReportUrl: data.qualityReportUrl,
    },
  });

  return NextResponse.json(settings);
}
