import { Package, Users, ShoppingBag, DollarSign } from "lucide-react";
import { getDashboardStats } from "@/lib/analytics";
import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import LeadsPieChart from "@/components/dashboard/LeadsPieChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500 mt-1">Vista general de tu tienda Bebitos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={Package}
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          title="Leads Captados"
          value={stats.totalLeads}
          icon={Users}
          trend="+5%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          title="Pedidos"
          value={stats.totalOrders}
          icon={ShoppingBag}
          trend="-2%"
          trendUp={false}
          color="purple"
        />
        <MetricCard
          title="Ingresos"
          value={`Bs. ${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend="+18%"
          trendUp={true}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <SalesChart data={stats.salesByMonth} />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <LeadsPieChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Pedidos Recientes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay pedidos recientes</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{order.customer}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("es")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-800">Bs. {order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "pendiente" ? "bg-yellow-100 text-yellow-800" :
                      order.status === "confirmado" ? "bg-blue-100 text-blue-800" :
                      order.status === "enviado" ? "bg-purple-100 text-purple-800" :
                      order.status === "entregado" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <TopProductsChart />
        </div>
      </div>
    </div>
  );
}
