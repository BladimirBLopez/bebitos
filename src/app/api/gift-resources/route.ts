import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const resources = await prisma.giftResource.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(resources);
}
