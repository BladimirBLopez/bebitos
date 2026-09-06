"use client";

import { useState } from "react";
import Image from "next/image";

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
    <div className="min-h-screen bg-[#F0EBF8] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-[560px] flex flex-col gap-4">
        <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
          <div className="bg-green flex items-center gap-4 px-6 py-8">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0">
              <Image
                src="https://res.cloudinary.com/dkq95jus0/image/upload/v1787250386/Dise%C3%B1o_sin_t%C3%ADtulo_10_w98gei.png"
                alt="Bebitos"
                width={44}
                height={44}
                className="object-contain w-9 h-9"
              />
            </div>
            <div className="text-white flex items-center gap-2">
              <GiftIcon />
              <p className="font-display font-bold text-lg leading-tight">DESCARGA GRATIS</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
          <div className="h-2 bg-brown-dark" />
          <div className="p-6">
            <h1 className="text-[28px] leading-tight font-normal text-ink mb-3">
              Checklist y calendario de alimentación
            </h1>
            <p className="text-sm text-ink/70">
              Deja tus datos y te enviamos el link de descarga al toque. Nunca compartimos tu información con terceros.
            </p>
          </div>
        </div>

        {downloadUrl === null ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-white rounded-lg border border-black/10 p-6">
              <label className="text-[15px] text-ink block mb-3">
                ¿Cuál es tu nombre? <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Tu respuesta"
                className="w-full border-0 border-b border-black/20 focus:border-b-2 focus:border-brown-dark px-0.5 py-2 text-sm outline-none bg-transparent transition-colors"
              />
            </div>

            <div className="bg-white rounded-lg border border-black/10 p-6">
              <label className="text-[15px] text-ink block mb-1">
                ¿Número de WhatsApp? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-ink/50 mb-3">
                ¡Verifica que esté escrito correctamente, será nuestro medio de contacto!
              </p>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                inputMode="numeric"
                placeholder="Tu respuesta"
                className="w-full border-0 border-b border-black/20 focus:border-b-2 focus:border-brown-dark px-0.5 py-2 text-sm outline-none bg-transparent transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 px-2">{error}</p>
            )}

            <div className="flex items-center justify-between px-1">
              <button
                type="submit"
                disabled={loading}
                className="bg-white border border-black/10 hover:bg-cream/60 text-green-dark font-medium text-sm px-6 py-2.5 rounded transition-colors disabled:opacity-60"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
              <p className="text-xs text-ink/30">No compartas contraseñas aquí</p>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg border border-black/10 overflow-hidden">
            <div className="h-2 bg-green" />
            <div className="p-6">
              <h2 className="text-2xl font-normal text-ink mb-3">
                ¡Gracias por tu registro! 🤎
              </h2>
              {downloadUrl ? (
                <>
                  <p className="text-sm text-ink/70 mb-4">
                    Descarga aquí tus archivos gratis:
                  </p>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-dark text-sm underline break-all"
                  >
                    {downloadUrl}
                  </a>
                </>
              ) : (
                <p className="text-sm text-ink/70">
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
