import { prisma } from "./prisma";
import type { OrderStatus } from "@prisma/client";

export type ContabilidadStats = {
  totalIngresos: number;
  totalCosto: number;
  gananciaBruta: number;
  totalGastos: number;
  balance: number;
  monthly: { month: string; ingresos: number; gastos: number }[];
  gastosByCategory: { name: string; value: number }[];
};

// Estados que cuentan como venta real (confirmada o entregada).
// "pendiente" queda afuera a propósito: todavía no es un ingreso seguro.
// Un pedido "anulado=true" NUNCA cuenta como ingreso, sin importar su
// estado — anular no cambia el estado (sigue diciendo "entregado" en el
// historial), así que hay que filtrarlo aparte.
const REVENUE_STATUSES: OrderStatus[] = ["confirmado", "enviado", "entregado"];
const REVENUE_WHERE = { status: { in: REVENUE_STATUSES }, anulado: false };

export async function getContabilidadStats(): Promise<ContabilidadStats> {
  const [ingresosAgg, gastosAgg, revenueOrders] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: REVENUE_WHERE,
    }),
    prisma.gasto.aggregate({ _sum: { amount: true } }),
    prisma.order.findMany({
      where: REVENUE_WHERE,
      select: {
        items: { select: { quantity: true, cost: true } },
      },
    }),
  ]);

  const totalIngresos = ingresosAgg._sum?.total || 0;
  const totalGastos = gastosAgg._sum?.amount || 0;

  // Costo de lo vendido: si un producto no tiene costo asignado, se cuenta
  // como 0 (no resta), así que la ganancia real puede verse inflada hasta
  // que se le asigne costo a todos los productos.
  const totalCosto = revenueOrders.reduce((sum: number, order) => {
    const orderCost = order.items.reduce(
      (itemSum: number, item: { quantity: number; cost: number | null }) =>
        itemSum + (item.cost || 0) * item.quantity,
      0
    );
    return sum + orderCost;
  }, 0);

  const gananciaBruta = totalIngresos - totalCosto;
  const balance = gananciaBruta - totalGastos;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [monthlyOrders, monthlyGastos] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, ...REVENUE_WHERE },
      select: { total: true, createdAt: true },
    }),
    prisma.gasto.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString("es", { month: "short" });
  }).reverse();

  const ingresosByMonth: Record<string, number> = {};
  monthlyOrders.forEach((o) => {
    const m = o.createdAt.toLocaleString("es", { month: "short" });
    ingresosByMonth[m] = (ingresosByMonth[m] || 0) + o.total;
  });

  const gastosByMonth: Record<string, number> = {};
  monthlyGastos.forEach((g) => {
    const m = g.date.toLocaleString("es", { month: "short" });
    gastosByMonth[m] = (gastosByMonth[m] || 0) + g.amount;
  });

  const monthly = months.map((month) => ({
    month,
    ingresos: ingresosByMonth[month] || 0,
    gastos: gastosByMonth[month] || 0,
  }));

  const gastosByCategoryRaw = await prisma.gasto.groupBy({
    by: ["category"],
    _sum: { amount: true },
  });

  const gastosByCategory = gastosByCategoryRaw.map((g) => ({
    name: g.category,
    value: g._sum.amount || 0,
  }));

  return {
    totalIngresos,
    totalCosto,
    gananciaBruta,
    totalGastos,
    balance,
    monthly,
    gastosByCategory,
  };
}
