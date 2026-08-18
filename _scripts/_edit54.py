path = "src/app/api/admin/products/route.ts"
with open(path, "r") as f:
    content = f.read()

old = '''import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const product = await prisma.product.create({'''

new = '''import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateProduct } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const validation = validateProduct(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const product = await prisma.product.create({'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: POST products con validacion")
