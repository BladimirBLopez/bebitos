import { prisma } from "@/lib/prisma";
import VentasReportClient from "@/components/VentasReportClient";

export const dynamic = "force-dynamic";

// Todo lo que cuenta como venta real: confirmado, enviado o entregado.
// Se incluyen también las anuladas (para que el reporte sea transparente),
// pero el componente las excluye de los totales.
export default async function AdminVentasPage() {
  const sales = await prisma.order.findMany({
    where: { status: { in: ["confirmado", "enviado", "entregado"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return <VentasReportClient sales={sales} />;
}
