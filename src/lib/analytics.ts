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
  topProducts: { name: string; sales: number }[];
  leadsBySource: { name: string; value: number }[];
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

  // Productos más vendidos (top 5 por cantidad, excluyendo pedidos cancelados)
  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true },
    where: { order: { status: { not: "cancelado" } } },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const topProducts = topProductsRaw.map((p) => ({
    name: p.productName,
    sales: p._sum.quantity || 0,
  }));

  // Leads agrupados por fuente
  const leadsBySourceRaw = await prisma.lead.groupBy({
    by: ["source"],
    _count: { source: true },
  });

  const leadsBySource = leadsBySourceRaw.map((l) => ({
    name: l.source,
    value: l._count.source,
  }));

  return {
    totalProducts,
    totalLeads,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders,
    salesByMonth: formattedSales,
    topProducts,
    leadsBySource,
  };
}
