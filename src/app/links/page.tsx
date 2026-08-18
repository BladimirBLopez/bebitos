import Image from "next/image";

const WHATSAPP_NUMBER = "59169501208";
const MAPS_URL = "https://maps.app.goo.gl/JrdPzWFLudsLRbFD7";

const SOCIALS = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/bebitos.bo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@bebitos_bo",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S5 18 5 14.8s2.6-5.7 5.8-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.7Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z" />
      </svg>
    ),
  },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center px-6 py-14">
      <Image
        src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
        alt="Bebitos"
        width={84}
        height={84}
        className="rounded-full mb-3"
        priority
      />
      <h1 className="font-display text-2xl font-semibold text-brown-dark mb-1">
        Bebitos
      </h1>
      <p className="text-ink/60 text-sm mb-1">Lo mejor para tu bebé</p>
      <p className="text-green text-xs font-semibold tracking-wide mb-8">
        Envíos a nivel nacional 🇧🇴
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <a
          href="/"
          className="flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-display font-medium text-base py-4 rounded-2xl transition-colors"
        >
          🛍️ Ver catálogo
        </a>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green hover:bg-green-dark text-white font-display font-medium text-base py-4 rounded-2xl transition-colors"
        >
          💬 Comprar por WhatsApp
        </a>

        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white hover:bg-white/80 text-brown-dark font-medium text-sm py-3 rounded-xl border border-brown/15 transition-colors"
        >
          📍 Visítanos en nuestro punto físico
        </a>

        <div className="flex items-center gap-2 mt-1">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-white/80 text-brown-dark text-sm font-medium py-3 rounded-xl border border-brown/15 transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
