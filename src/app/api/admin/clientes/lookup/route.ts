import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireReadAccess } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const user = await requireReadAccess();

  if (!user) {
    return NextResponse.json(
      { error: "Sesión no válida o usuario inactivo" },
      { status: 401 }
    );
  }

  try {
    const phone = req.nextUrl.searchParams.get("phone")?.trim();

    if (!phone || !/^\d{6,15}$/.test(phone)) {
      return NextResponse.json({ found: false }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const cliente = await prisma.cliente.findFirst({ where: { phone } });

    if (!cliente) {
      return NextResponse.json({ found: false }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const [orderCount, lastOrder] = await Promise.all([
      prisma.order.count({ where: { clienteId: cliente.id } }),
      prisma.order.findFirst({
        where: { clienteId: cliente.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json(
      {
        found: true,
        cliente: {
          id: cliente.id,
          name: cliente.name,
          phone: cliente.phone,
          email: cliente.email,
        },
        orderCount,
        lastOrderAt: lastOrder?.createdAt || null,
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
