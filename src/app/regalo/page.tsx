"use client";

import { useState } from "react";
import Image from "next/image";

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-10 h-10">
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, whatsapp, source: "regalo-alimentacion" }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Algo salió mal, intenta de nuevo.");
      return;
    }

    const data = await res.json();
    setDownloadUrl(data.downloadUrl || "");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center px-6 pt-12 pb-16">
      <div className="w-24 h-24 rounded-full border-[3px] border-white shadow-lg overflow-hidden relative bg-white flex items-center justify-center mb-4">
        <Image
          src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787250386/Dise%C3%B1o_sin_t%C3%ADtulo_10_w98gei.png"
          alt="Bebitos"
          width={110}
          height={110}
          className="object-contain w-full h-full"
          priority
        />
      </div>

      <div className="w-full max-w-sm bg-white rounded-[24px] border border-brown/10 shadow-lg p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green/15 text-green-dark flex items-center justify-center mx-auto mb-3">
          <GiftIcon />
        </div>
        <h1 className="font-display font-bold text-brown-dark text-xl mb-1">
          Descarga gratis 🎁
        </h1>
        <p className="text-ink/60 text-sm mb-6">
          Checklist de alimentos + calendario semanal para la introducción alimentaria de tu bebé
        </p>

        {downloadUrl === null ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Tu nombre
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                placeholder="Ej. María"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Tu WhatsApp
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                inputMode="numeric"
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                placeholder="59169501208"
              />
              <p className="text-[11px] text-ink/40 mt-1">
                Verifica que esté bien escrito, será nuestro medio de contacto
              </p>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-green hover:bg-green-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Quiero mi regalo"}
            </button>
          </form>
        ) : downloadUrl ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink/70">
              ¡Gracias, {name}! Aquí está tu descarga 💛
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green hover:bg-green-dark text-white font-semibold py-3 rounded-full transition-colors"
            >
              Descargar ahora
            </a>
          </div>
        ) : (
          <p className="text-sm text-ink/60">
            ¡Gracias, {name}! En breve te escribimos por WhatsApp con tu regalo 💛
          </p>
        )}
      </div>
    </div>
  );
}
