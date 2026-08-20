"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({
  title,
  text,
  iconOnly,
}: {
  title: string;
  text?: string;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // usuario canceló, no hacemos nada
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        aria-label="Compartir"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-cream hover:bg-white/30 transition-colors"
      >
        {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-brown-dark/70 hover:text-brown-dark border border-brown/15 hover:border-brown/30 rounded-full px-3.5 py-2 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          ¡Copiado!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Compartir
        </>
      )}
    </button>
  );
}
