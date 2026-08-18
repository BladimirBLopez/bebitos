import Image from "next/image";
import Link from "next/link";
import CartDrawer from "./CartDrawer";

type HeaderProps = {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
};

export default function Header({
  whatsapp = "59169501208",
  instagramUrl = "https://www.instagram.com/bebitos.bo",
  facebookUrl = "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr",
  tiktokUrl = "https://www.tiktok.com/@bebitos_bo",
}: HeaderProps) {
  const socials = [
    { name: "Instagram", url: instagramUrl },
    { name: "Facebook", url: facebookUrl },
    { name: "TikTok", url: tiktokUrl },
  ];

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
          <Image
            src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
            alt="Bebitos"
            width={110}
            height={35}
            className="hidden sm:block object-contain"
          />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3">
            {socials.map((s) => (
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
            href={`https://wa.me/${whatsapp}`}
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
