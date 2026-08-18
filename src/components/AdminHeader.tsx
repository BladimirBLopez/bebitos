"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="bg-brown-dark">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-display font-semibold text-cream">
            Panel Bebitos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-sm bg-cream text-brown-dark font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors"
          >
            Ver página web
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-cream/70 hover:text-cream px-2"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
