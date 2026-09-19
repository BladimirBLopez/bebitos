"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, ScanLine, X } from "lucide-react";

type ScannerInstance = {
  start: (
    camera: { facingMode: string },
    config: {
      fps: number;
      qrbox: { width: number; height: number };
    },
    onSuccess: (text: string) => void,
    onError: () => void
  ) => Promise<unknown>;
  stop: () => Promise<void>;
  clear: () => void;
};

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

  const elementId =
    `scanner-${rawId.replace(/:/g, "")}`;

  const scannerRef =
    useRef<ScannerInstance | null>(null);

  const detectedRef = useRef(false);

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
    if (!open) {
      return;
    }

    let cancelled = false;

    detectedRef.current = false;
    setError("");

    async function startScanner() {
      try {
        /*
         * Importación dinámica:
         * html5-qrcode solamente se carga
         * cuando realmente abrimos la cámara.
         */
        const {
          Html5Qrcode,
          Html5QrcodeSupportedFormats,
        } = await import("html5-qrcode");

        if (cancelled) {
          return;
        }

        const scanner =
          new Html5Qrcode(elementId, {
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
          }) as ScannerInstance;

        scannerRef.current = scanner;

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 10,
            qrbox: {
              width: 260,
              height: 140,
            },
          },
          (decodedText) => {
            if (
              cancelled ||
              detectedRef.current
            ) {
              return;
            }

            const code =
              decodedText.trim();

            if (!code) {
              return;
            }

            detectedRef.current = true;

            onDetectedRef.current(code);
          },
          () => {
            /*
             * html5-qrcode llama esto muchas
             * veces mientras busca un código.
             * No es un error real.
             */
          }
        );

        /*
         * Si el modal se cerró mientras
         * la cámara estaba arrancando.
         */
        if (cancelled) {
          try {
            await scanner.stop();
          } catch {}

          try {
            scanner.clear();
          } catch {}
        }
      } catch (err) {
        console.error(
          "Error al iniciar lector:",
          err
        );

        if (!cancelled) {
          setError(
            "No se pudo abrir la cámara. Verifica el permiso de cámara del navegador."
          );
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;

      const scanner =
        scannerRef.current;

      scannerRef.current = null;

      if (!scanner) {
        return;
      }

      void scanner
        .stop()
        .catch(() => {})
        .finally(() => {
          try {
            scanner.clear();
          } catch {}
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
              onClick={() =>
                onCloseRef.current()
              }
              className="text-panel-ink-soft hover:text-panel-ink rounded-lg p-1"
              aria-label="Cerrar lector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error ? (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />

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
                onClick={() =>
                  onCloseRef.current()
                }
                className="w-full mt-4 bg-brown-dark text-white text-sm font-semibold py-2.5 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div
                id={elementId}
                className="w-full aspect-square rounded-xl overflow-hidden bg-black"
              />

              <p className="text-xs text-panel-ink-soft text-center mt-3">
                Apunta la cámara al código de barras.
                Se detectará automáticamente.
              </p>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
