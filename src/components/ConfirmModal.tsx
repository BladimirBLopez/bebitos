"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
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
            className="flex-1 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 py-2.5 rounded-full transition-colors"
          >
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
