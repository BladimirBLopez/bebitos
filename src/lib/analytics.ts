import { prisma } from "./prisma";

export type Trend = { trend: string | null; trendUp: boolean };

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
  trends: {
    products: Trend;
    leads: Trend;
    orders: Trend;
    revenue: Trend;
  };
};

function calcTrend(current: number, previous: number): Trend {
  if (previous === 0 && current === 0) {
    return { trend: null, trendUp: true };
  }
  if (previous === 0) {
    return { trend: "Nuevo", trendUp: true };
  }
  const change = ((current - previous) / previous) * 100;
  const trendUp = change >= 0;
  const trend = `${trendUp ? "+" : ""}${change.toFixed(0)}%`;
  return { trend, trendUp };
}

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

  // ── Tendencias: mes actual vs. mes anterior ──
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    productsThisMonth,
    productsLastMonth,
    leadsThisMonth,
    leadsLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    revenueThisMonth,
    revenueLastMonth,
  ] = await Promise.all([
    prisma.product.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.product.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
    }),
    prisma.lead.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.lead.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfThisMonth },
        status: { not: "cancelado" },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
        status: { not: "cancelado" },
      },
    }),
  ]);

  const trends = {
    products: calcTrend(productsThisMonth, productsLastMonth),
    leads: calcTrend(leadsThisMonth, leadsLastMonth),
    orders: calcTrend(ordersThisMonth, ordersLastMonth),
    revenue: calcTrend(
      revenueThisMonth._sum.total || 0,
      revenueLastMonth._sum.total || 0
    ),
  };

  return {
    totalProducts,
    totalLeads,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    recentOrders,
    salesByMonth: formattedSales,
    topProducts,
    leadsBySource,
    trends,
  };
}
