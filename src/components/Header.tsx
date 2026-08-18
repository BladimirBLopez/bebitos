import Image from "next/image";
import Link from "next/link";
import CartDrawer from "./CartDrawer";

const SOCIALS = [
  { name: "Instagram", url: "https://www.instagram.com/bebitos.bo" },
  { name: "Facebook", url: "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr" },
  { name: "TikTok", url: "https://www.tiktok.com/@bebitos_bo" },
];

const WHATSAPP_NUMBER = "59169501208";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown/15">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
            alt="Bebitos"
            width={44}
            height={44}
            className="rounded-full"
            priority
          />
          <span className="font-display font-semibold text-xl text-brown-dark hidden sm:block">
            Bebitos
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brown-dark/70 hover:text-brown-dark transition-colors hidden sm:block"
              >
                {s.name}
              </a>
            ))}
          </nav>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2 rounded-full transition-colors"
          >
            WhatsApp
          </a>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
