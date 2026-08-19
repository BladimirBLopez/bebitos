"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type Category = { id: string; name: string };

export default function MobileMenu({
  instagramUrl,
  facebookUrl,
  tiktokUrl,
}: {
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (open && categories.length === 0) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then(setCategories)
        .catch(() => {});
    }
  }, [open, categories.length]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-brown-dark p-1.5 sm:hidden"
        aria-label="Menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] sm:hidden h-dvh">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[80%] h-dvh bg-cream flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-brown/10">
              <span className="font-display font-semibold text-brown-dark">Menú</span>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-brown-dark" />
              </button>
            </div>

            <nav className="flex flex-col p-4 gap-1">
              <Link href="/" onClick={() => setOpen(false)} className="py-2.5 text-ink font-medium">
                Inicio
              </Link>
              <Link href="/links" onClick={() => setOpen(false)} className="py-2.5 text-ink font-medium">
                Nuestros enlaces
              </Link>
              <Link href="/calidad" onClick={() => setOpen(false)} className="py-2.5 text-ink font-medium">
                Calidad y seguridad
              </Link>

              {categories.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-ink/40 uppercase mt-3 mb-1">
                    Categorías
                  </p>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/?categoria=${encodeURIComponent(c.name)}`}
                      onClick={() => setOpen(false)}
                      className="py-2 text-ink/80 text-sm"
                    >
                      {c.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            <div className="mt-auto flex items-center gap-3 px-4 py-4 border-t border-brown/10">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-brown-dark/60 text-xs">
                  Instagram
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-brown-dark/60 text-xs">
                  Facebook
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-brown-dark/60 text-xs">
                  TikTok
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
