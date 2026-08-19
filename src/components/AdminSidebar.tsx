"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Tag, Settings, LogOut, ExternalLink, Link2 } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
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
    <aside className="w-full sm:w-56 sm:min-h-screen bg-brown-dark flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={110}
            height={35}
            className="object-contain w-[100px] h-auto brightness-0 invert opacity-90"
          />
        </div>
        <div className="flex items-center gap-3 sm:hidden">
          <Link href="/" target="_blank" className="text-cream/70" title="Ver tienda">
            <ExternalLink className="w-4.5 h-4.5" />
          </Link>
          <Link href="/links" target="_blank" className="text-cream/70" title="Ver links">
            <Link2 className="w-4.5 h-4.5" />
          </Link>
          <button onClick={handleLogout} className="text-cream/70">
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <nav className="flex sm:flex-col gap-1.5 px-3 sm:px-2 pb-3 sm:pb-0 sm:py-4 overflow-x-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? "bg-cream text-brown-dark"
                  : "bg-cream/10 sm:bg-transparent text-cream/80 sm:text-cream/70 hover:bg-cream/20 hover:text-cream"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden sm:flex flex-col gap-1 px-2 pb-4 border-t border-cream/10 pt-3 mt-auto">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          Ver tienda
        </Link>
        <Link
          href="/links"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors"
        >
          <Link2 className="w-4 h-4 shrink-0" />
          Ver links
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
