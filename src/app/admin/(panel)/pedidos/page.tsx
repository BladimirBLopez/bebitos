import { prisma } from "@/lib/prisma";
import PedidosListClient from "@/components/PedidosListClient";

export const dynamic = "force-dynamic";

const STATUS_ORDER: Record<string, number> = {
  pendiente: 0,
  confirmado: 1,
  enviado: 2,
  entregado: 3,
  cancelado: 4,
};

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    where: {
      origin: "online",
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const sorted = [...orders].sort((a, b) => {
    const statusDiff =
      (STATUS_ORDER[a.status] ?? 99) -
      (STATUS_ORDER[b.status] ?? 99);

    if (statusDiff !== 0) return statusDiff;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return <PedidosListClient orders={sorted} />;
}
