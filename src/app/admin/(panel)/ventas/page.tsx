import { prisma } from "@/lib/prisma";
import VentasReportClient from "@/components/VentasReportClient";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage() {
  const sales = await prisma.order.findMany({
    where: {
      status: "entregado",
    },
    include: {
      items: true,
    },
    orderBy: {
      deliveredAt: "desc",
    },
  });

  return <VentasReportClient sales={sales} />;
}
