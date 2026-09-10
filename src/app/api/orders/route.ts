import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";

type CartItemInput = { productId: string; quantity: number };

function validateCartItems(
  data: unknown
): { valid: boolean; items?: CartItemInput[]; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Datos inválidos" };
  }
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.items) || d.items.length === 0) {
    return { valid: false, error: "El carrito está vacío" };
  }
  const items: CartItemInput[] = [];
  for (const raw of d.items) {
    if (!raw || typeof raw !== "object") {
      return { valid: false, error: "Formato de producto inválido" };
    }
    const it = raw as Record<string, unknown>;
    if (!it.productId || typeof it.productId !== "string") {
      return { valid: false, error: "Falta el producto" };
    }
    const quantity = Number(it.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { valid: false, error: "Cantidad inválida" };
    }
    items.push({ productId: it.productId, quantity });
  }
  return { valid: true, items };
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const validation = validateCartItems(data);
  if (!validation.valid || !validation.items) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const items = validation.items;
  const productIds = items.map((i) => i.productId);

  const body = data as Record<string, unknown>;
  const customerName =
    typeof body.customer === "string" && body.customer.trim()
      ? body.customer.trim().slice(0, 150)
      : "Cliente de WhatsApp";
  const customerPhone =
    typeof body.phone === "string" && /^\d{6,15}$/.test(body.phone.trim())
      ? body.phone.trim()
      : "00000000";

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
          throw new Error(`Sin stock suficiente de "${product.name}"`);
        }
        const price =
          product.isPromo && product.promoPrice ? product.promoPrice : product.price;
        total += price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price,
        });
      }

      const newOrder = await tx.order.create({
        data: {
          customer: customerName,
          phone: customerPhone,
          total,
          status: "pendiente",
          origin: "online",
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

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
