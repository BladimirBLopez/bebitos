import { prisma } from "@/lib/prisma";
import PedidosListClient from "@/components/PedidosListClient";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  // Los pendientes (lo que requiere acción) siempre arriba
  const sorted = [...orders].sort((a, b) => {
    if (a.status === "pendiente" && b.status !== "pendiente") return -1;
    if (b.status === "pendiente" && a.status !== "pendiente") return 1;
    return 0;
  });

  return <PedidosListClient orders={sorted} />;
}
