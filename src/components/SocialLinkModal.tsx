"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function SocialLinkModal({
  open,
  platform,
  currentUrl,
  onSave,
  onClose,
}: {
  open: boolean;
  platform: string;
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(currentUrl);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[90]" />
        <Dialog.Content className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl p-6 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-display font-semibold text-ink text-lg">
              Agregar {platform}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-ink/40 hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          <label className="text-xs font-medium text-ink/60 block mb-1">{platform}</label>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`https://${platform.toLowerCase()}.com/tutienda`}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40 mb-1"
          />
          <p className="text-[11px] text-ink/40 mb-5">Pega el enlace a tu perfil de {platform}</p>
          <button
            onClick={() => onSave(value)}
            className="w-full bg-brown-dark hover:bg-ink text-cream font-semibold py-3 rounded-full transition-colors"
          >
            Guardar
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
