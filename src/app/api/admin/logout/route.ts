import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function GET() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
