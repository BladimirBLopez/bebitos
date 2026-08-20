import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLOUD_NAME = "dkq95jus0";

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

const BACKGROUND_IMAGE = "bebitos/w8jzhkpowpj9eesluoys";

export default async function LinksPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });

  const whatsapp = settings?.whatsapp || "59169501208";
  const mapsUrl = settings?.mapsUrl || "https://maps.app.goo.gl/JrdPzWFLudsLRbFD7";
  const shippingText = settings?.shippingText || "Envios a nivel nacional";
  const backgroundImage = BACKGROUND_IMAGE;

  const socials = [
    { name: "Instagram", url: settings?.instagramUrl || "https://www.instagram.com/bebitos.bo", desc: "Novedades y promos" },
    { name: "TikTok", url: settings?.tiktokUrl || "https://www.tiktok.com/@bebitos_bo", desc: "Videos y tips para tu bebé" },
    { name: "Facebook", url: settings?.facebookUrl || "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr", desc: "Síguenos y entérate primero" },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        {backgroundImage ? (
          <Image
            src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200,h_2400,c_fill,e_blur:400/${backgroundImage}`}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-brown-dark" />
        )}
        <div className="absolute inset-0 bg-brown-dark/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/30 via-brown-dark/80 to-cream" />
      </div>

      <div className="relative flex flex-col items-center px-6 pt-14">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[4px] border-white shadow-2xl overflow-hidden relative bg-white flex items-center justify-center">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787203042/Dise%C3%B1o_sin_t%C3%ADtulo_10_yatmgd.png"
            alt="Bebitos"
            width={140}
            height={140}
            className="object-contain w-[70%] h-auto"
            priority
          />
        </div>

        <p className="flex items-center gap-1 text-cream/90 text-sm mt-4 drop-shadow-sm">
          <PinIcon />
          Santa Cruz, Bolivia
        </p>
        <p className="text-cream/95 text-sm text-center max-w-xs mt-2 leading-relaxed drop-shadow-sm">
          🍼 Bebitos | Todo para la alimentación de tu bebé. Encuentra platos, cucharas
          y accesorios seguros, prácticos y de alta calidad. ✨
        </p>
        <p className="text-green text-xs font-bold tracking-wide mt-2 mb-4 drop-shadow-sm">
          {shippingText} 🇧🇴
        </p>

        <div className="flex items-center gap-3 mb-6">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-brown/15 shadow-sm flex items-center justify-center text-brown-dark hover:bg-brown-dark hover:text-cream transition-colors"
            >
              {ICONS[s.name]}
            </a>
          ))}
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <a
            href="/"
            className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
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
            className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
              <ChatIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Comprar por WhatsApp</p>
              <p className="text-xs text-cream/70">Pedidos y consultas</p>
            </div>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
          >
            <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
              <PinIcon />
            </span>
            <div className="text-left">
              <p className="font-display font-medium text-sm">Visítanos</p>
              <p className="text-xs text-cream/70">Nuestro punto físico en Santa Cruz</p>
            </div>
          </a>

          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-brown-dark hover:bg-ink text-cream rounded-2xl px-4 py-3.5 shadow-md transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-cream/15 flex items-center justify-center shrink-0">
                {ICONS[s.name]}
              </span>
              <div className="text-left">
                <p className="font-display font-medium text-sm">{s.name}</p>
                <p className="text-xs text-cream/70">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-ink/30 text-xs mt-8 mb-6">Bebitos © 2024</p>
      </div>
    </div>
  );
}
