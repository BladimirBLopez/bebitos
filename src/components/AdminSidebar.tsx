"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Settings, LogOut, ExternalLink } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full sm:w-56 sm:min-h-screen bg-brown-dark flex sm:flex-col shrink-0">
      <div className="flex items-center gap-2 px-4 py-4 sm:border-b border-cream/10">
        <Image
          src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
          alt="Bebitos"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="font-display font-semibold text-cream text-sm hidden sm:block">
          Panel Bebitos
        </span>
      </div>

      <nav className="flex sm:flex-col gap-1 px-2 py-2 sm:py-4 flex-1 overflow-x-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-cream text-brown-dark"
                  : "text-cream/70 hover:bg-cream/10 hover:text-cream"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex sm:flex-col gap-1 px-2 py-2 sm:pb-4 sm:border-t border-cream/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors whitespace-nowrap"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          Ver página web
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors whitespace-nowrap"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
