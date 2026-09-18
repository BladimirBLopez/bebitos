"use client";

import { useEffect, useState } from "react";
import {
  X,
  Banknote,
  QrCode,
  Landmark,
  CheckCircle2,
} from "lucide-react";

type Props = {
  open: boolean;
  orderLabel: string;
  total: number;
  saving?: boolean;
  onConfirm: (method: string) => void | Promise<void>;
  onCancel: () => void;
};

const METHODS = [
  {
    value: "efectivo",
    label: "Efectivo",
    icon: Banknote,
  },
  {
    value: "qr",
    label: "QR",
    icon: QrCode,
  },
  {
    value: "transferencia",
    label: "Transferencia",
    icon: Landmark,
  },
];

export default function PaymentModal({
  open,
  orderLabel,
  total,
  saving = false,
  onConfirm,
  onCancel,
}: Props) {
  const [method, setMethod] = useState("");

  useEffect(() => {
    if (open) setMethod("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !saving && onCancel()}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-panel-surface rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-panel-border">
          <div>
            <h2 className="font-bold text-panel-ink">
              Registrar pago
            </h2>
            <p className="text-xs text-panel-ink-soft mt-0.5">
              {orderLabel}
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="p-1.5 rounded-lg text-panel-ink-soft hover:bg-panel-bg disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <div className="bg-panel-bg rounded-xl p-4 mb-5">
            <p className="text-xs text-panel-ink-soft">
              Total a registrar
            </p>
            <p className="text-2xl font-bold text-brown-dark mt-1">
              Bs. {total.toFixed(2)}
            </p>
          </div>

          <p className="text-xs font-semibold text-panel-ink mb-2">
            Método de pago
          </p>

          <div className="grid gap-2">
            {METHODS.map((item) => {
              const Icon = item.icon;
              const active = method === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMethod(item.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    active
                      ? "border-green bg-green/5"
                      : "border-panel-border hover:bg-panel-bg"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      active
                        ? "bg-green/10 text-green-dark"
                        : "bg-panel-bg text-panel-ink-soft"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="flex-1 text-sm font-semibold text-panel-ink">
                    {item.label}
                  </span>

                  {active && (
                    <CheckCircle2 className="w-5 h-5 text-green-dark" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-panel-border bg-panel-bg/50">
          <button
            type="button"
            disabled={saving}
            onClick={onCancel}
            className="flex-1 text-sm font-semibold text-panel-ink-soft py-2.5 rounded-lg disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!method || saving}
            onClick={() => onConfirm(method)}
            className="flex-[2] bg-green hover:bg-green-dark text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {saving ? "Registrando..." : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
