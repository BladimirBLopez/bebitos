"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { RotateCcw } from "lucide-react";

export default function AnularModal({
  open,
  orderLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  orderLabel: string;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}) {
  const [motivo, setMotivo] = useState("");

  function handleConfirm() {
    onConfirm(motivo.trim());
    setMotivo("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[90]" />
        <Dialog.Content className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl p-6 shadow-xl focus:outline-none">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-red-50">
            <RotateCcw className="w-5 h-5 text-red-500" />
          </div>
          <Dialog.Title className="font-display font-semibold text-ink text-lg mb-1">
            ¿Anular a {orderLabel}?
          </Dialog.Title>
          <Dialog.Description className="text-ink/60 text-sm mb-3">
            El producto vuelve a tu stock y queda marcado como anulado en el historial. Esta acción no se puede deshacer.
          </Dialog.Description>

          <label className="text-xs text-ink/60 block mb-1">Motivo (opcional)</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={2}
            placeholder="Ej. cliente se arrepintió, error al registrar..."
            className="w-full mb-5 px-3 py-2 rounded-lg border border-ink/10 text-sm focus:outline-none focus:ring-2 focus:ring-brown-dark/20"
          />

          <div className="flex gap-2">
            <Dialog.Close asChild>
              <button
                onClick={onCancel}
                className="flex-1 text-sm font-semibold text-ink/60 hover:text-ink py-2.5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              Sí, anular
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
