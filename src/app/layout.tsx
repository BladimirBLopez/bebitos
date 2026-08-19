import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const SITE_URL = "https://bebitos.online";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
