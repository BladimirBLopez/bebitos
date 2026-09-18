import { prisma } from "@/lib/prisma";
import VentasReportClient from "@/components/VentasReportClient";

export const dynamic = "force-dynamic";

// Una venta real es una operación que llegó a "entregado".
// Las anuladas se conservan para auditoría, pero no suman a los totales.
export default async function AdminVentasPage() {
  const sales = await prisma.order.findMany({
    where: {
      status: "entregado",
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <VentasReportClient sales={sales} />;
}
