"use client";

import * as Dialog from "@radix-ui/react-dialog";
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
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[90]" />
        <Dialog.Content className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl p-6 shadow-xl focus:outline-none">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${danger ? "bg-red-50" : "bg-brown-dark/10"}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? "text-red-500" : "text-brown-dark"}`} />
          </div>
          <Dialog.Title className="font-display font-semibold text-ink text-lg mb-1">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-ink/60 text-sm mb-5">
            {message}
          </Dialog.Description>
          <div className="flex gap-2">
            <Dialog.Close asChild>
              <button
                onClick={onCancel}
                className="flex-1 text-sm font-medium text-ink/70 bg-cream hover:bg-cream/70 py-2.5 rounded-full transition-colors"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              className={`flex-1 text-sm font-semibold text-white py-2.5 rounded-full transition-colors ${
                danger ? "bg-red-500 hover:bg-red-600" : "bg-brown-dark hover:bg-ink"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
