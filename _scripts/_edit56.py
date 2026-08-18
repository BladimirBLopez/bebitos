path = "src/app/api/admin/settings/route.ts"
with open(path, "r") as f:
    content = f.read()

old = '''import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {'''

new = '''import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateSettings } from "@/lib/validation";

export async function GET() {'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)

old2 = '''export async function PUT(req: NextRequest) {
  const data = await req.json();

  const settings = await prisma.settings.update({'''

new2 = '''export async function PUT(req: NextRequest) {
  const data = await req.json();

  const validation = validateSettings(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const settings = await prisma.settings.update({'''

count2 = content.count(old2)
assert count2 == 1, f"Encontrado {count2} veces, se esperaba 1"
content = content.replace(old2, new2)

with open(path, "w") as f:
    f.write(content)
print("OK: settings con validacion")
