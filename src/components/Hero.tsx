"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Truck, ShieldCheck, MessageCircle } from "lucide-react";

const CLOUD_NAME = "dkq95jus0";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

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
      <div className="relative max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">
        <motion.h1
          className="font-display text-5xl sm:text-6xl font-semibold mb-4"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          Lo mejor para tu bebé
        </motion.h1>
        <motion.p
          className="text-cream/80 max-w-xl mx-auto text-base sm:text-lg mb-8"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          Articulos y accesorios pensados para el cuidado y la alimentacion de tu bebe, con la calidad que se merece.
        </motion.p>
        <motion.a
          href="#catalogo"
          className="inline-block bg-green hover:bg-green-dark text-white font-semibold px-7 py-3.5 rounded-full transition-colors mb-8 shadow-lg shadow-green/20"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          whileTap={{ scale: 0.97 }}
        >
          Ver productos
        </motion.a>

        <motion.div
          className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap text-cream/85"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
