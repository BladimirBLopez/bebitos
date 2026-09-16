import Link from "next/link";
import { AlertTriangle, PackageX, CheckCircle2, ArrowRight } from "lucide-react";

export default function AlertBanner({
  pendingOrders,
  lowStockProducts,
}: {
  pendingOrders: number;
  lowStockProducts: { id: string; name: string; stock: number }[];
}) {
  const hasAlerts = pendingOrders > 0 || lowStockProducts.length > 0;

  if (!hasAlerts) {
    return (
      <div className="flex items-center gap-2.5 bg-green-soft text-green-dark rounded-xl px-4 py-3 mb-6 text-sm font-medium">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        Todo en orden: sin pedidos pendientes ni stock bajo.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-6">
      {pendingOrders > 0 && (
        <Link
          href="/admin/pedidos"
          className="flex items-center gap-2.5 bg-amber-soft text-amber rounded-xl px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            {pendingOrders} pedido{pendingOrders === 1 ? "" : "s"} pendiente{pendingOrders === 1 ? "" : "s"} de confirmar
          </span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      )}
      {lowStockProducts.length > 0 && (
        <Link
          href="/admin/inventario"
          className="flex items-center gap-2.5 bg-red-soft text-red rounded-xl px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PackageX className="w-4 h-4 shrink-0" />
          <span className="flex-1">
            {lowStockProducts.length} producto{lowStockProducts.length === 1 ? "" : "s"} con stock bajo: {lowStockProducts.map((p) => p.name).slice(0, 3).join(", ")}
            {lowStockProducts.length > 3 ? "…" : ""}
          </span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      )}
    </div>
  );
}
