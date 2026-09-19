"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, ScanLine, X } from "lucide-react";

export default function BarcodeScanner({
  open,
  onDetected,
  onClose,
}: {
  open: boolean;
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const rawId = useId();
  const elementId = `scanner-${rawId.replace(/:/g, "")}`;

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onDetectedRef = useRef(onDetected);
  const onCloseRef = useRef(onClose);

  const [error, setError] = useState("");

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    let disposed = false;
    let started = false;
    let detected = false;

    setError("");

    const scanner = new Html5Qrcode(elementId, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
      ],
      verbose: false,
    });

    scannerRef.current = scanner;

    const startPromise = scanner
      .start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,
          qrbox: {
            width: 260,
            height: 140,
          },
          aspectRatio: 1.777778,
        },
        (decodedText) => {
          if (disposed || detected) {
            return;
          }

          const code = decodedText.trim();

          if (!code) {
            return;
          }

          detected = true;

          onDetectedRef.current(code);
        },
        () => {
          // Es normal que se ejecute mientras la cámara busca un código.
        }
      )
      .then(() => {
        started = true;
      })
      .catch((err) => {
        if (disposed) {
          return;
        }

        console.error(
          "No se pudo iniciar el lector:",
          err
        );

        setError(
          "No se pudo acceder a la cámara. Revisa que hayas permitido el acceso a la cámara en el navegador."
        );
      });

    return () => {
      disposed = true;

      void startPromise.finally(async () => {
        if (started) {
          try {
            await scanner.stop();
          } catch {
            // Puede estar detenido ya.
          }
        }

        try {
          scanner.clear();
        } catch {
          // Evita errores durante el desmontaje.
        }

        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
      });
    };
  }, [open, elementId]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCloseRef.current();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-[95]" />

        <Dialog.Content className="fixed z-[96] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-panel-surface rounded-2xl p-4 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-brown-dark" />

              <Dialog.Title className="text-sm font-semibold text-panel-ink">
                Escanea el código de barras
              </Dialog.Title>
            </div>

            <button
              type="button"
              onClick={() => onCloseRef.current()}
              className="text-panel-ink-soft hover:text-panel-ink rounded-lg p-1"
              aria-label="Cerrar lector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!error ? (
            <>
              <div
                id={elementId}
                className="w-full aspect-square rounded-xl overflow-hidden bg-black"
              />

              <p className="text-xs text-panel-ink-soft text-center mt-3">
                Apunta la cámara al código de barras. Se detectará automáticamente.
              </p>
            </>
          ) : (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Cámara no disponible
                  </p>

                  <p className="text-xs text-amber-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCloseRef.current()}
                className="w-full mt-4 bg-brown-dark text-white text-sm font-semibold py-2.5 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
