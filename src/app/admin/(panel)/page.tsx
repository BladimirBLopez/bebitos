import { prisma } from "@/lib/prisma";
import { Package, Tag, PackageX, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [total, enPromo, sinStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isPromo: true } }),
    prisma.product.count({ where: { inStock: false } }),
  ]);

  const stats = [
    { label: "Productos totales", value: total, icon: Package, color: "bg-brown-dark" },
    { label: "En promoción", value: enPromo, icon: Tag, color: "bg-green" },
    { label: "Sin stock", value: sinStock, icon: PackageX, color: "bg-red-400" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brown-dark mb-1">
        Hola, Bebitos 🤎
      </h1>
      <p className="text-ink/50 text-sm mb-6">Resumen de tu tienda</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-display font-semibold text-ink">{s.value}</p>
              <p className="text-sm text-ink/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3" style={{ boxShadow: "var(--shadow-card)" }}>
        <div>
          <p className="font-medium text-ink text-sm">¿Quieres ver cómo luce tu tienda?</p>
          <p className="text-ink/50 text-xs">Se abre en una pestaña nueva</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-full transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ver página web
        </Link>
      </div>
    </div>
  );
}
