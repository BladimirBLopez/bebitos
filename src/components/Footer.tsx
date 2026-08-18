import Image from "next/image";
import Link from "next/link";

const ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4.5 h-4.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S5 18 5 14.8s2.6-5.7 5.8-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.7Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z" />
    </svg>
  ),
};

type Category = { id: string; name: string };

type FooterProps = {
  whatsapp?: string;
  mapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  businessHours?: string;
  categories?: Category[];
};

export default function Footer({
  whatsapp = "59169501208",
  mapsUrl,
  instagramUrl = "https://www.instagram.com/bebitos.bo",
  facebookUrl = "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr",
  tiktokUrl = "https://www.tiktok.com/@bebitos_bo",
  businessHours,
  categories = [],
}: FooterProps) {
  const socials = [
    { name: "Instagram", url: instagramUrl },
    { name: "Facebook", url: facebookUrl },
    { name: "TikTok", url: tiktokUrl },
  ];

  return (
    <footer className="bg-brown-dark text-cream mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={120}
            height={38}
            className="object-contain w-[120px] h-auto mb-3 brightness-0 invert opacity-90"
          />
          <p className="text-cream/60 text-sm mb-4">Lo mejor para tu bebé.</p>
          <div className="flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center transition-colors"
                aria-label={s.name}
              >
                {ICONS[s.name]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display font-semibold text-sm mb-3">Categorías</p>
          <ul className="flex flex-col gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/?categoria=${encodeURIComponent(c.name)}`}
                  className="text-cream/60 hover:text-cream text-sm transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display font-semibold text-sm mb-3">Enlaces</p>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/" className="text-cream/60 hover:text-cream text-sm transition-colors">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/links" className="text-cream/60 hover:text-cream text-sm transition-colors">
                Nuestros enlaces
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display font-semibold text-sm mb-3">Contacto</p>
          <ul className="flex flex-col gap-2 text-sm text-cream/60">
            <li>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">
                WhatsApp
              </a>
            </li>
            {mapsUrl && (
              <li>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">
                  Ubicación
                </a>
              </li>
            )}
            {businessHours && <li>{businessHours}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-4 text-center text-cream/40 text-xs">
        Bebitos © {new Date().getFullYear()} · Todos los derechos reservados
      </div>
    </footer>
  );
}
