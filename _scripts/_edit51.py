path = "src/app/layout.tsx"
with open(path, "r") as f:
    content = f.read()

old = '''export const metadata: Metadata = {
  title: "Bebitos | Lo mejor para tu bebé",
  description: "Articulos y accesorios para bebe en Bolivia. Alimentacion, cuidado y mas, con envios a nivel departamental.",
};'''

new = '''const SITE_URL = "https://bebitos-sable.vercel.app";
const OG_IMAGE = "https://res.cloudinary.com/dkq95jus0/image/upload/v1787086146/Dise%C3%B1o_sin_t%C3%ADtulo_8_ccrkbc.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bebitos | Lo mejor para tu bebé",
  description: "Articulos y accesorios para bebe en Bolivia. Alimentacion, cuidado y mas, con envios a nivel departamental.",
  openGraph: {
    title: "Bebitos | Lo mejor para tu bebé",
    description: "Articulos y accesorios para bebe en Bolivia. Alimentacion, cuidado y mas, con envios a nivel departamental.",
    url: SITE_URL,
    siteName: "Bebitos",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Bebitos" }],
    locale: "es_BO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bebitos | Lo mejor para tu bebé",
    description: "Articulos y accesorios para bebe en Bolivia.",
    images: [OG_IMAGE],
  },
};'''

count = content.count(old)
assert count == 1, f"Encontrado {count} veces, se esperaba 1"
content = content.replace(old, new)
with open(path, "w") as f:
    f.write(content)
print("OK: layout.tsx con Open Graph general")
