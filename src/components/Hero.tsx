import Image from "next/image";
import { Truck, ShieldCheck, MessageCircle } from "lucide-react";

const CLOUD_NAME = "dkq95jus0";

export default function Hero({
  shippingText,
  backgroundImage,
}: {
  shippingText?: string;
  backgroundImage?: string;
}) {
  return (
    <section className="relative bg-brown-dark text-cream overflow-hidden">
      {backgroundImage && (
        <Image
          src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1600,h_700,c_fill,e_blur:200/${backgroundImage}`}
          alt=""
          fill
          className="object-cover opacity-40"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/60 to-brown-dark/90" />
      <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-4">
          Lo mejor para tu bebé
        </h1>
        <p className="text-cream/80 max-w-xl mx-auto text-base sm:text-lg mb-7">
          Articulos y accesorios pensados para el cuidado y la alimentacion de tu bebe, con la calidad que se merece.
        </p>
        <a
          href="#catalogo"
          className="inline-block bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors mb-8"
        >
          Ver productos
        </a>

        <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap text-cream/85">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">{shippingText || "Envíos a nivel nacional"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">Productos seguros</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm">Atención por WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}
