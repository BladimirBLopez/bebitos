"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Contact,
  Wallet,
  Settings,
  LogOut,
  Box,
  ClipboardList,
  Menu,
  X,
  ShoppingCart,
  ClipboardCheck,
  Globe,
  Link2,
} from "lucide-react";
import { useCurrentUser } from "@/lib/user-context";

const groups = [
  {
    label: null as string | null,
    links: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false }],
  },
  {
    label: "Finanzas",
    links: [
      { href: "/admin/ventas", label: "Ventas", icon: ShoppingCart, adminOnly: false },
      { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardCheck, adminOnly: false },
      { href: "/admin/contabilidad", label: "Contabilidad", icon: Wallet, adminOnly: true },
    ],
  },
  {
    label: "Personas",
    links: [
      { href: "/admin/clientes", label: "Clientes", icon: Contact, adminOnly: false },
      { href: "/admin/leads", label: "Leads", icon: ClipboardList, adminOnly: false },
      { href: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
    ],
  },
  {
    label: "Catálogo",
    links: [
      { href: "/admin/productos", label: "Productos", icon: Package, adminOnly: false },
      { href: "/admin/inventario", label: "Inventario", icon: Box, adminOnly: false },
      { href: "/admin/categorias", label: "Categorías", icon: ShoppingBag, adminOnly: false },
    ],
  },
  {
    label: "Sistema",
    links: [{ href: "/admin/configuracion", label: "Configuración", icon: Settings, adminOnly: true }],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { role } = useCurrentUser();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => !link.adminOnly || role === "ADMIN"),
    }))
    .filter((group) => group.links.length > 0);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-5">
      {visibleGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-1.5 text-xs font-semibold text-panel-ink-soft/70">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-brown-dark/8 text-brown-dark"
                      : "text-panel-ink-soft hover:bg-panel-bg hover:text-panel-ink"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brown-dark" />
                  )}
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const ExternalLinks = () => (
    <div className="space-y-0.5">
      <a
        href="https://bebitos.online"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-panel-ink-soft hover:bg-panel-bg hover:text-panel-ink transition-colors"
      >
        <Globe className="w-4 h-4" />
        Ver tienda
      </a>
      <a
        href="https://bebitos.online/links"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-panel-ink-soft hover:bg-panel-bg hover:text-panel-ink transition-colors"
      >
        <Link2 className="w-4 h-4" />
        Página de enlaces
      </a>
    </div>
  );

  return (
    <>
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

      {open && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <aside className="relative w-72 max-w-[85%] h-full bg-panel-surface border-r border-panel-border p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
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
              <ExternalLinks />
            </div>
            <div className="mt-2 pt-2 border-t border-panel-border">
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

      <aside className="hidden sm:flex sm:flex-col w-64 bg-panel-surface border-r border-panel-border h-screen sticky top-0 overflow-y-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brown-dark">Bebitos Admin</h2>
        </div>
        <NavLinks />
        <div className="mt-auto pt-4 border-t border-panel-border">
          <ExternalLinks />
        </div>
        <div className="mt-2 pt-2 border-t border-panel-border">
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
