"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Box,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/inventario", label: "Inventario", icon: Box },
  { href: "/admin/categorias", label: "Categorías", icon: ShoppingBag },
  { href: "/admin/leads", label: "Leads", icon: ClipboardList },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1">
      {links.map((link) => {
        const active = isActive(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-brown-dark text-cream"
                : "text-panel-ink-soft hover:bg-panel-bg hover:text-panel-ink"
            }`}
          >
            <Icon className="w-4 h-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Barra superior mobile */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-panel-surface border-b border-panel-border">
        <h2 className="text-lg font-bold text-brown-dark">Bebitos Admin</h2>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="p-2 rounded-lg text-panel-ink hover:bg-panel-bg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-64 max-w-[80%] h-full bg-panel-surface border-r border-panel-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-brown-dark">Bebitos Admin</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="p-1.5 rounded-lg text-panel-ink hover:bg-panel-bg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-8 pt-4 border-t border-panel-border">
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-panel-ink-soft hover:bg-panel-bg hover:text-panel-ink"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden sm:flex sm:flex-col w-64 bg-panel-surface border-r border-panel-border h-screen sticky top-0 overflow-y-auto p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-brown-dark">Bebitos Admin</h2>
        </div>
        <NavLinks />
        <div className="mt-8 pt-4 border-t border-panel-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-panel-ink-soft hover:bg-panel-bg hover:text-panel-ink"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
