import { prisma } from "./prisma";

export type ContabilidadStats = {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  monthly: { month: string; ingresos: number; gastos: number }[];
  gastosByCategory: { name: string; value: number }[];
};

export async function getContabilidadStats(): Promise<ContabilidadStats> {
  const [ingresosAgg, gastosAgg] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "cancelado" } },
    }),
    prisma.gasto.aggregate({ _sum: { amount: true } }),
  ]);

  const totalIngresos = ingresosAgg._sum.total || 0;
  const totalGastos = gastosAgg._sum.amount || 0;
  const balance = totalIngresos - totalGastos;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [monthlyOrders, monthlyGastos] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: "cancelado" } },
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

  return { totalIngresos, totalGastos, balance, monthly, gastosByCategory };
}
