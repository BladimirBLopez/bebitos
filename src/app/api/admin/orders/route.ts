import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { validateOrder } from "@/lib/validation";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const validation = validateOrder(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const items = data.items as { productId: string; quantity: number }[];
  const productIds = items.map((i) => i.productId);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let total = 0;
      const orderItemsData: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
      }[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`
          );
        }

        const price = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
        total += price * item.quantity;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price,
        });
      }

      const phone = data.phone.trim();
      const customerName = data.customer.trim();
      const email = data.email?.trim() || null;

      // Buscar cliente existente por teléfono, o crearlo si no existe
      let cliente = await tx.cliente.findFirst({ where: { phone } });
      if (!cliente) {
        cliente = await tx.cliente.create({
          data: { name: customerName, phone, email },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          customer: customerName,
          email,
          phone,
          total,
          status: "pendiente",
          clienteId: cliente.id,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      for (const item of items) {
        const product = productMap.get(item.productId)!;
        const newStock = product.stock - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock, inStock: newStock > 0 },
        });
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
