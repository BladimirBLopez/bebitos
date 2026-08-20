import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CLOUD_NAME = "dkq95jus0";

const ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
      <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S5 18 5 14.8s2.6-5.7 5.8-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.7Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z" />
    </svg>
  ),
};

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9">
      <path d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9">
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-9 h-9">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L4 20l1.05-4.4A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.34a9.9 9.9 0 0 0 4.62 1.17h.01c5.46 0 9.9-4.45 9.9-9.92C21.95 6.45 17.5 2 12.04 2Zm5.83 14.03c-.24.68-1.4 1.3-1.93 1.34-.49.05-.98.24-3.28-.68-2.77-1.11-4.55-3.94-4.69-4.13-.14-.19-1.13-1.5-1.13-2.86s.7-2.03.95-2.31c.24-.27.53-.34.71-.34l.51.01c.16 0 .38-.06.6.46l.83 2.01c.07.16.12.35.02.55-.1.2-.15.32-.29.5-.14.17-.3.38-.43.51-.14.14-.29.29-.13.57.16.29.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.29.14.46.12.63-.07.17-.19.72-.83.91-1.12.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
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
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787228252/bebitos_logo_circulo_etjyti.png"
            alt="Bebitos"
            width={140}
            height={140}
            className="object-contain w-full h-full"
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
            className="flex items-center gap-4 w-full min-h-[92px] bg-white hover:bg-cream/60 text-brown-dark rounded-[28px] px-6 py-5 border border-brown/10 shadow-lg transition-colors"
          >
            <span className="w-10 h-10 text-brown-dark flex items-center justify-center shrink-0">
              <BagIcon />
            </span>
            <div className="text-center flex-1">
              <p className="font-display font-bold text-lg">Ver catálogo</p>
              <p className="text-sm text-ink/50">Todos nuestros productos</p>
            </div>
          </a>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 w-full min-h-[92px] bg-white hover:bg-cream/60 text-brown-dark rounded-[28px] px-6 py-5 border border-brown/10 shadow-lg transition-colors"
          >
            <span className="w-10 h-10 text-brown-dark flex items-center justify-center shrink-0">
              <WhatsAppIcon />
            </span>
            <div className="text-center flex-1">
              <p className="font-display font-bold text-lg">Comprar por WhatsApp</p>
              <p className="text-sm text-ink/50">Pedidos y consultas</p>
            </div>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 w-full min-h-[92px] bg-white hover:bg-cream/60 text-brown-dark rounded-[28px] px-6 py-5 border border-brown/10 shadow-lg transition-colors"
          >
            <span className="w-10 h-10 text-brown-dark flex items-center justify-center shrink-0">
              <PinIcon />
            </span>
            <div className="text-center flex-1">
              <p className="font-display font-bold text-lg">Visítanos</p>
              <p className="text-sm text-ink/50">Nuestro punto físico en Santa Cruz</p>
            </div>
          </a>

          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full min-h-[92px] bg-white hover:bg-cream/60 text-brown-dark rounded-[28px] px-6 py-5 border border-brown/10 shadow-lg transition-colors"
            >
              <span className="w-10 h-10 text-brown-dark flex items-center justify-center shrink-0">
                {ICONS[s.name]}
              </span>
              <div className="text-center flex-1">
                <p className="font-display font-bold text-lg">{s.name}</p>
                <p className="text-sm text-ink/50">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <p className="text-ink/30 text-xs mt-8 mb-6">Bebitos © 2024</p>
      </div>
    </div>
  );
}
