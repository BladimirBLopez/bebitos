import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { validateOrder } from "@/lib/validation";
import {
  requireReadAccess,
  requireWriteAccess,
} from "@/lib/permissions";

type OrderInputItem = {
  productId: string;
  quantity: number;
};

function aggregateQuantities(
  items: OrderInputItem[]
) {
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

export async function GET() {
  const user = await requireReadAccess();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Sesión no válida o usuario inactivo",
      },
      { status: 401 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}

// Venta directa / mostrador.
// Nace entregada, pagada y con el stock descontado.
export async function POST(req: NextRequest) {
  const user = await requireWriteAccess();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "No tienes permiso para esta acción",
      },
      { status: 403 }
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

  const validation = validateOrder(data);

  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const body = data as {
    customer: string;
    phone: string;
    email?: string;
    paymentMethod: string;
    items: OrderInputItem[];
  };

  const items = body.items;
  const aggregatedItems =
    aggregateQuantities(items);

  const productIds = aggregatedItems.map(
    (item) => item.productId
  );

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const products =
          await tx.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },
          });

        const productMap = new Map(
          products.map((product) => [
            product.id,
            product,
          ])
        );

        /*
         * Validamos el TOTAL solicitado por producto.
         * Esto evita que líneas duplicadas puedan
         * superar el stock real.
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

          if (product.stock < item.quantity) {
            throw new Error(
              `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`
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

        const phone = body.phone.trim();
        const customerName =
          body.customer.trim();
        const email =
          body.email?.trim() || null;

        let cliente =
          await tx.cliente.findFirst({
            where: {
              phone,
            },
          });

        if (!cliente) {
          cliente = await tx.cliente.create({
            data: {
              name: customerName,
              phone,
              email,
            },
          });
        }

        /*
         * Descuento ATÓMICO.
         *
         * "stock >= cantidad" forma parte del UPDATE.
         * Si otra venta consume stock entre la lectura
         * y este punto, count será 0 y toda esta
         * transacción se revierte.
         */
        for (const item of aggregatedItems) {
          const product = productMap.get(
            item.productId
          )!;

          const updated =
            await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: {
                  gte: item.quantity,
                },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

          if (updated.count !== 1) {
            throw new Error(
              `El stock de "${product.name}" cambió mientras registrabas la venta. Revisa el inventario e intenta nuevamente`
            );
          }

          const current =
            await tx.product.findUnique({
              where: {
                id: item.productId,
              },
              select: {
                stock: true,
              },
            });

          if (
            current &&
            current.stock <= 0
          ) {
            await tx.product.update({
              where: {
                id: item.productId,
              },
              data: {
                inStock: false,
              },
            });
          }
        }

        const now = new Date();

        return tx.order.create({
          data: {
            customer: customerName,
            email,
            phone,
            total,
            status: "entregado",
            origin: "manual",
            paymentMethod:
              body.paymentMethod,
            paymentStatus: "pagado",
            paidAt: now,
            deliveredAt: now,
            stockDeducted: true,
            clienteId: cliente.id,
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

    return NextResponse.json(order);
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
