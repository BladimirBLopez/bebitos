import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S5 18 5 14.8s2.6-5.7 5.8-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.7Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z" />
    </svg>
  ),
};

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L4 20l1.05-4.4A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

export default async function LinksPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });

  const whatsapp = settings?.whatsapp || "59169501208";
  const mapsUrl = settings?.mapsUrl || "https://maps.app.goo.gl/JrdPzWFLudsLRbFD7";
  const shippingText = settings?.shippingText || "Envios a nivel nacional";

  const socials = [
    { name: "Instagram", url: settings?.instagramUrl || "https://www.instagram.com/bebitos.bo", desc: "Novedades y promos" },
    { name: "TikTok", url: settings?.tiktokUrl || "https://www.tiktok.com/@bebitos_bo", desc: "Videos y tips para tu bebé" },
    { name: "Facebook", url: settings?.facebookUrl || "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr", desc: "Síguenos y entérate primero" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Banda superior con degradado */}
      <div className="h-32 bg-gradient-to-br from-brown-dark to-brown relative" />

      <div className="flex flex-col items-center px-6 -mt-12">
        <Image
          src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
          alt="Bebitos"
          width={96}
          height={96}
          className="rounded-full border-4 border-cream shadow-md"
          priority
        />

        <h1 className="font-display text-2xl font-semibold text-brown-dark mt-3">
          Bebitos
        </h1>
        <p className="flex items-center gap-1 text-ink/60 text-sm mt-0.5">
          <PinIcon />
          Santa Cruz, Bolivia
        </p>
        <p className="text-green text-xs font-semibold tracking-wide mt-1 mb-4">
          {shippingText} 🇧🇴
        </p>

        <div className="flex items-center gap-3 mb-6">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-brown/15 flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-cream transition-colors"
            >
              {ICONS[s.name]}
            </a>
          ))}
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <a
            href="/"
            className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
              <BagIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Ver catálogo</p>
              <p className="text-xs text-cream/70">Todos nuestros productos</p>
            </div>
          </a>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green hover:bg-green-dark text-white rounded-2xl px-4 py-3.5 transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <ChatIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Comprar por WhatsApp</p>
              <p className="text-xs text-white/70">Pedidos y consultas</p>
            </div>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white hover:bg-white/80 text-brown-dark rounded-2xl px-4 py-3.5 border border-brown/15 transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
              <PinIcon />
            </span>
            <div className="text-left">
              <p className="font-medium text-sm">Visítanos</p>
              <p className="text-xs text-ink/50">Nuestro punto físico en Santa Cruz</p>
            </div>
          </a>

          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white hover:bg-white/80 text-brown-dark rounded-2xl px-4 py-3.5 border border-brown/15 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                {ICONS[s.name]}
              </span>
              <div className="text-left">
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-ink/50">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-ink/30 text-xs mt-8 mb-6">Bebitos © 2026</p>
      </div>
    </div>
  );
}
