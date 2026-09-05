import { prisma } from "@/lib/prisma";
import { Package, Tag, PackageX, ExternalLink } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

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
    { label: "Sin stock", value: sinStock, icon: PackageX, color: "bg-amber" },
  ];

  return (
    <div>
      <PageHeader
        title="Hola, Bebitos 🤎"
        meta="Resumen de tu tienda"
        action={
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver tienda
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-panel-surface rounded-xl border border-panel-border p-5" style={{ boxShadow: "var(--shadow-panel)" }}>
              <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <p className="text-2xl font-sans font-bold text-panel-ink">{s.value}</p>
              <p className="text-sm text-panel-ink-soft">{s.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}