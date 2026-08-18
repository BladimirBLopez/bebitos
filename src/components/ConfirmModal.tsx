"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Borrar",
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${danger ? "bg-red-50" : "bg-brown-dark/10"}`}>
          <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-500" : "text-brown-dark"}`} />
        </div>
        <h3 className="font-display font-semibold text-ink text-lg mb-1">
          {title}
        </h3>
        <p className="text-ink/60 text-sm mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-medium text-ink/70 bg-cream hover:bg-cream/70 py-2.5 rounded-full transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-sm font-semibold text-white py-2.5 rounded-full transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-brown-dark hover:bg-ink"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
