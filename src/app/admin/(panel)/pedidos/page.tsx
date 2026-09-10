import { prisma } from "@/lib/prisma";
import PedidosListClient from "@/components/PedidosListClient";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return <PedidosListClient orders={orders} />;
}
