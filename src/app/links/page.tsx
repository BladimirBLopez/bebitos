import Image from "next/image";

const LINKS = [
  { label: "Ver catálogo", href: "/", icon: "🍼" },
  { label: "WhatsApp", href: "https://wa.me/59169501208", icon: "💬" },
  { label: "Instagram", href: "https://www.instagram.com/bebitos.bo", icon: "📷" },
  { label: "Facebook", href: "https://www.facebook.com/share/1LfNHku3nT/?mibextid=wwXIfr", icon: "👍" },
  { label: "TikTok", href: "https://www.tiktok.com/@bebitos_bo", icon: "🎵" },
];

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-brown-dark flex flex-col items-center px-6 py-16">
      <Image
        src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787019365/Dise%C3%B1o_sin_t%C3%ADtulo_7_qau8wd.png"
        alt="Bebitos"
        width={96}
        height={96}
        className="rounded-full mb-4"
        priority
      />
      <h1 className="font-display text-2xl font-semibold text-cream mb-1">
        Bebitos
      </h1>
      <p className="text-cream/70 text-sm mb-8">
        Lo mejor para tu bebé
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-cream hover:bg-white text-brown-dark font-semibold py-3.5 rounded-full transition-colors"
          >
            <span>{link.icon}</span>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
