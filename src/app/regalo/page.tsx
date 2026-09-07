"use client";

import { useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

const CLOUD_NAME = "dkq95jus0";
const BABY_AGE_OPTIONS = ["Estoy en embarazo", "0-3 meses", "4-6 meses", "7-12 meses", "+1 año"];

type GiftResource = { id: string; label: string; image: string };

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-8 h-8">
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M4 9h16v3.5H4V9Z" />
      <path d="M12 9v11" />
      <path d="M12 9c-1-2.5-2.7-4-4.2-4C6.4 5 5.5 5.9 5.5 7c0 1.3 1 2 2.3 2H12Z" />
      <path d="M12 9c1-2.5 2.7-4 4.2-4C17.6 5 18.5 5.9 18.5 7c0 1.3-1 2-2.3 2H12Z" />
    </svg>
  );
}

export default function RegaloPage() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [babyAge, setBabyAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [resources, setResources] = useState<GiftResource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación: exactamente 8 dígitos
    if (!/^\d{8}$/.test(whatsapp)) {
      setError("El número de WhatsApp debe tener exactamente 8 dígitos (sin código de país)");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, whatsapp, babyAge, source: "regalo-alimentacion" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Algo salió mal, intenta de nuevo.");
      return;
    }

    setSubmitted(true);
    setLoadingResources(true);
    try {
      const resResources = await fetch("/api/gift-resources");
      const data = await resResources.json();
      setResources(data);
    } finally {
      setLoadingResources(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[520px] flex flex-col gap-4">

        {/* Banner colorido, estilo tienda */}
        <div className="bg-white rounded-[24px] border border-brown/10 shadow-lg overflow-hidden">
          <div className="bg-green flex items-center gap-4 px-6 py-7">
            <div className="w-16 h-16 rounded-full bg-white border-[3px] border-white shadow flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="https://res.cloudinary.com/dkq95jus0/image/upload/v1788792338/1000608308_1_cdjcwt.png"
                alt="Bebitos"
                width={130}
                height={130}
                className="object-contain w-28 h-28"
              />
            </div>
            <div className="text-white flex items-center gap-2">
              <GiftIcon />
              <p className="font-display font-bold text-2xl leading-tight tracking-wide">DESCARGA GRATIS</p>
            </div>
          </div>
        </div>

        {/* Titulo */}
        <div className="bg-white rounded-[24px] border border-brown/10 shadow-lg overflow-hidden">
          <div className="h-2 bg-brown" />
          <div className="p-6">
            <h1 className="font-display font-bold text-[26px] leading-tight text-brown-dark mb-2">
              Checklist y calendario de alimentación 🥑
            </h1>
            <p className="text-sm text-ink/60">
              Deja tus datos y descarga tus archivos al toque. Nunca compartimos tu información con terceros.
            </p>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-white rounded-[24px] border border-brown/10 shadow-lg p-6">
              <label className="font-display font-semibold text-brown-dark text-base block mb-3">
                ¿Cuál es tu nombre? <span className="text-red-400">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu respuesta"
                className="w-full border-0 border-b-2 border-cream focus:border-green px-1 py-2 text-sm outline-none bg-transparent transition-colors"
              />
            </div>

            <div className="bg-white rounded-[24px] border border-brown/10 shadow-lg p-6">
              <label className="font-display font-semibold text-brown-dark text-base block mb-1">
                ¿Número de WhatsApp? <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-ink/40 mb-3">
                ¡Verifica que esté escrito correctamente! Son exactamente 8 dígitos (sin código de país).
              </p>
              <input
                value={whatsapp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 8) {
                    setWhatsapp(value);
                  }
                }}
                required
                inputMode="numeric"
                placeholder="Ej: 71234567"
                className="w-full border-0 border-b-2 border-cream focus:border-green px-1 py-2 text-sm outline-none bg-transparent transition-colors"
              />
            </div>

            <div className="bg-white rounded-[24px] border border-brown/10 shadow-lg p-6">
              <label className="font-display font-semibold text-brown-dark text-base block mb-3">
                ¿Edad de tu bebé? <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col gap-2.5">
                {BABY_AGE_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 text-sm text-ink cursor-pointer">
                    <input
                      type="radio"
                      name="babyAge"
                      value={opt}
                      checked={babyAge === opt}
                      onChange={(e) => setBabyAge(e.target.value)}
                      required
                      className="w-4 h-4 accent-green"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 px-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-green hover:bg-green-dark text-white font-display font-bold text-lg py-3.5 rounded-full shadow-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar 🎁"}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-[24px] border border-brown/10 shadow-lg overflow-hidden">
            <div className="h-2 bg-green" />
            <div className="p-6">
              <h2 className="font-display font-bold text-2xl text-brown-dark mb-2">
                ¡Gracias por tu registro! 🤎
              </h2>

              {loadingResources ? (
                <p className="text-sm text-ink/60">Cargando tus archivos...</p>
              ) : resources.length > 0 ? (
                <>
                  <p className="text-sm text-ink/60 mb-4">
                    Descarga aquí tus archivos gratis:
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {resources.map((r) => (
                      <a
                        key={r.id}
                        href={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_attachment/${r.image}`}
                        className="flex items-center justify-between gap-3 bg-cream hover:bg-cream/70 rounded-2xl px-4 py-3 transition-colors"
                      >
                        <span className="font-medium text-brown-dark text-sm">{r.label}</span>
                        <span className="flex items-center gap-1.5 bg-green text-white text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
                          <Download className="w-3.5 h-3.5" />
                          Descargar
                        </span>
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink/60">
                  En breve te escribimos por WhatsApp con tu regalo 💛
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-ink/30 text-center py-4">Bebitos.online</p>
      </div>
    </div>
  );
}
