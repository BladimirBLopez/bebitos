import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

type CartItemInput = {
  productId: string;
  quantity: number;
};

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

  if (d.items.length > 50) {
    return {
      valid: false,
      error: "El pedido contiene demasiados productos",
    };
  }

  const items: CartItemInput[] = [];

  for (const raw of d.items) {
    if (!raw || typeof raw !== "object") {
      return {
        valid: false,
        error: "Formato de producto inválido",
      };
    }

    const it = raw as Record<string, unknown>;

    if (
      !it.productId ||
      typeof it.productId !== "string" ||
      !it.productId.trim()
    ) {
      return { valid: false, error: "Falta el producto" };
    }

    const quantity = Number(it.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 999
    ) {
      return {
        valid: false,
        error: "Cantidad inválida",
      };
    }

    items.push({
      productId: it.productId.trim(),
      quantity,
    });
  }

  return { valid: true, items };
}

function aggregateQuantities(items: CartItemInput[]) {
  const totals = new Map<string, number>();

  for (const item of items) {
    totals.set(
      item.productId,
      (totals.get(item.productId) ?? 0) +
        item.quantity
    );
  }

  return Array.from(totals, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export async function POST(req: NextRequest) {
  const rateLimit = await checkRateLimit(
    req,
    "orders",
    8,
    15 * 60 * 1000
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: `Demasiados pedidos seguidos. Intenta de nuevo en ${rateLimit.retryAfterMinutes} minuto${
          rateLimit.retryAfterMinutes === 1 ? "" : "s"
        }.`,
      },
      { status: 429 }
    );
  }

  let data: unknown;

  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const validation = validateCartItems(data);

  if (!validation.valid || !validation.items) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const items = validation.items;
  const aggregatedItems = aggregateQuantities(items);
  const productIds = aggregatedItems.map(
    (item) => item.productId
  );

  // El pedido online se registra sin solicitar datos personales.
  // La vendedora asignará el cliente desde el panel antes de confirmarlo.
  const customerName = "Sin cliente asignado";
  const customerPhone = "";

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const products = await tx.product.findMany({
          where: {
            id: { in: productIds },
          },
        });

        const productMap = new Map(
          products.map((product) => [
            product.id,
            product,
          ])
        );

        /*
         * El stock se valida por PRODUCTO, no por línea.
         *
         * Ejemplo:
         * - 3 unidades color blanco
         * - 3 unidades color café
         *
         * Si existen 5 unidades físicas del producto,
         * el total solicitado es 6 y el pedido debe
         * rechazarse.
         */
        for (const item of aggregatedItems) {
          const product = productMap.get(
            item.productId
          );

          if (!product) {
            throw new Error(
              `Producto no encontrado: ${item.productId}`
            );
          }

          if (!product.inStock) {
            throw new Error(
              `"${product.name}" no está disponible actualmente`
            );
          }

          if (product.stock < item.quantity) {
            throw new Error(
              `Sin stock suficiente de "${product.name}" (disponible: ${product.stock})`
            );
          }
        }

        let total = 0;

        const orderItemsData: {
          productId: string;
          productName: string;
          quantity: number;
          price: number;
          cost: number | null;
        }[] = [];

        for (const item of items) {
          const product = productMap.get(
            item.productId
          );

          if (!product) {
            throw new Error(
              `Producto no encontrado: ${item.productId}`
            );
          }

          const price =
            product.isPromo &&
            product.promoPrice !== null
              ? product.promoPrice
              : product.price;

          total += price * item.quantity;

          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price,
            cost: product.cost ?? null,
          });
        }

        return tx.order.create({
          data: {
            customer: customerName,
            phone: customerPhone,
            total,
            status: "pendiente",
            origin: "online",
            stockDeducted: false,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: true,
          },
        });
      }
    );

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      operationNumber: order.operationNumber,
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error interno";

    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
