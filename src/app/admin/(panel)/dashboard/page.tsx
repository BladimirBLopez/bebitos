import { Package, Users, ShoppingBag, DollarSign, Tag, PackageX } from "lucide-react";
import { getDashboardStats } from "@/lib/analytics";
import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import LeadsPieChart from "@/components/dashboard/LeadsPieChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 bg-panel-bg min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-panel-ink">Panel de Control</h1>
        <p className="text-panel-ink-soft mt-1">Vista general de tu tienda Bebitos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          trend={stats.trends.products.trend}
          trendUp={stats.trends.products.trendUp}
          color="brown"
        />
        <MetricCard
          title="Leads Captados"
          value={stats.totalLeads}
          icon={Users}
          trend={stats.trends.leads.trend}
          trendUp={stats.trends.leads.trendUp}
          color="green"
        />
        <MetricCard
          title="Pedidos"
          value={stats.totalOrders}
          icon={ShoppingBag}
          trend={stats.trends.orders.trend}
          trendUp={stats.trends.orders.trendUp}
          color="amber"
        />
        <MetricCard
          title="Ingresos"
          value={`Bs. ${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={stats.trends.revenue.trend}
          trendUp={stats.trends.revenue.trendUp}
          color="ink"
        />
        <MetricCard
          title="En Promoción"
          value={stats.enPromo}
          icon={Tag}
          color="amberSoft"
        />
        <MetricCard
          title="Sin Stock"
          value={stats.sinStock}
          icon={PackageX}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border">
          <SalesChart data={stats.salesByMonth} />
        </div>
        <div className="bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border">
          <LeadsPieChart data={stats.leadsBySource} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border">
          <h2 className="text-lg font-semibold text-panel-ink mb-3">Pedidos Recientes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-panel-ink-soft text-sm">No hay pedidos recientes</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex justify-between items-center border-b border-panel-border pb-2">
                  <div>
                    <p className="font-medium text-sm text-panel-ink">{order.customer}</p>
                    <p className="text-xs text-panel-ink-soft">{new Date(order.createdAt).toLocaleDateString("es")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-panel-ink">Bs. {order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "pendiente" ? "bg-amber-soft text-amber" :
                      order.status === "confirmado" ? "bg-brown-soft text-brown-dark" :
                      order.status === "enviado" ? "bg-ink-soft-bg text-ink" :
                      order.status === "entregado" ? "bg-green-soft text-green-dark" :
                      "bg-red-soft text-red"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-panel-surface p-4 rounded-xl shadow-panel border border-panel-border">
          <TopProductsChart data={stats.topProducts} />
        </div>
      </div>
    </div>
  );
}
