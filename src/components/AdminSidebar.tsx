"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Box } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/productos", label: "Productos", icon: Package },
    { href: "/admin/inventario", label: "Inventario", icon: Box }, // ← NUEVO
    { href: "/admin/categorias", label: "Categorías", icon: ShoppingBag },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-brown-dark">Bebitos Admin</h2>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brown-dark text-cream"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link
          href="/api/admin/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Link>
      </div>
    </aside>
  );
}
