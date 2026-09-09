import { prisma } from "./prisma";

export type DashboardStats = {
  totalProducts: number;
  totalLeads: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    customer: string;
    total: number;
    status: string;
    createdAt: Date;
  }[];
  salesByMonth: { month: string; sales: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    totalProducts,
    totalLeads,
    totalOrders,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.lead.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "cancelado" } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customer: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  // Ventas por mes (últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      status: { not: "cancelado" },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  // Agrupar por mes
  const salesByMonth = monthlyOrders.reduce((acc, order) => {
    const month = order.createdAt.toLocaleString("es", { month: "short" });
    acc[month] = (acc[month] || 0) + order.total;
    return acc;
  }, {} as Record<string, number>);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString("es", { month: "short" });
  }).reverse();

  const formattedSales = months.map((month) => ({
    month,
    sales: salesByMonth[month] || 0,
  }));

  return {
    totalProducts,
    totalLeads,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders,
    salesByMonth: formattedSales,
  };
}
