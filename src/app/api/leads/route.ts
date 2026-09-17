import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLead } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(req, "leads", 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Demasiados intentos seguidos. Intenta de nuevo en ${rateLimit.retryAfterMinutes} minuto${
          rateLimit.retryAfterMinutes === 1 ? "" : "s"
        }.`,
      },
      { status: 429 }
    );
  }

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
