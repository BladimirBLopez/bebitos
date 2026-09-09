import { Package, Users, ShoppingBag, DollarSign } from "lucide-react";
import { getDashboardStats } from "@/lib/analytics";
import MetricCard from "@/components/dashboard/MetricCard";
import SalesChart from "@/components/dashboard/SalesChart";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-4 md:p-6">
      <h1 className="font-display text-2xl md:text-3xl font-bold text-brown-dark mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <MetricCard
          title="Productos"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Leads"
          value={stats.totalLeads}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Pedidos"
          value={stats.totalOrders}
          icon={ShoppingBag}
          color="purple"
        />
        <MetricCard
          title="Ingresos"
          value={`Bs. ${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={stats.salesByMonth} />
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-brown/10">
          <h2 className="font-display text-lg font-semibold text-brown-dark mb-3">
            Pedidos Recientes
          </h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-ink/50 text-sm">No hay pedidos recientes</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex justify-between items-center border-b border-brown/5 pb-2">
                  <div>
                    <p className="font-medium text-sm">{order.customer}</p>
                    <p className="text-xs text-ink/50">{new Date(order.createdAt).toLocaleDateString("es")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">Bs. {order.total.toFixed(2)}</p>
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
      </div>
    </div>
  );
}
