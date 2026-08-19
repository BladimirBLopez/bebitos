"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function QuickCategoryModal({
  open,
  onSave,
  onClose,
}: {
  open: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink text-lg">
            Nueva categoría
          </h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>
        <label className="text-xs font-medium text-ink/60 block mb-1">Nombre</label>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && value.trim() && onSave(value.trim())}
          placeholder="Ej: Higiene"
          className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40 mb-5"
        />
        <button
          onClick={() => value.trim() && onSave(value.trim())}
          disabled={!value.trim()}
          className="w-full bg-brown-dark hover:bg-ink text-cream font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
        >
          Crear categoría
        </button>
      </div>
    </div>
  );
}
