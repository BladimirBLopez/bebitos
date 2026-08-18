import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({ data: { name: name.trim() } });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Esa categoría ya existe" }, { status: 400 });
  }
}
