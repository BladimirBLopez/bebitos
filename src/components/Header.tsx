import Image from "next/image";
import Link from "next/link";
import CartDrawer from "./CartDrawer";
import SearchBar from "./SearchBar";
import MobileMenu from "./MobileMenu";

type Category = { id: string; name: string };

type HeaderProps = {
  whatsapp?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  categories?: Category[];
};

export default function Header({
  instagramUrl = "https://www.instagram.com/bebitos.bo",
  facebookUrl = "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr",
  tiktokUrl = "https://www.tiktok.com/@bebitos_bo",
  categories = [],
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brown/15">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MobileMenu instagramUrl={instagramUrl} facebookUrl={facebookUrl} tiktokUrl={tiktokUrl} />
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png"
              alt="Bebitos"
              width={150}
              height={47}
              className="object-contain w-[120px] sm:w-[170px] h-auto"
              priority
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?categoria=${encodeURIComponent(c.name)}`}
              className="text-sm text-brown-dark/70 hover:text-brown-dark transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <SearchBar />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
