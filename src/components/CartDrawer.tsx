"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartDrawer({ whatsapp }: { whatsapp?: string }) {
  const WHATSAPP_NUMBER = whatsapp || "59169501208";
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQty, totalItems, totalPrice, clearCart } = useCart();

  function buildWhatsappMessage() {
    const lines = items.map(
      (i) =>
        `- ${i.name}${i.color ? ` (${i.color})` : ""} x${i.qty} = BOB ${i.qty * i.price}`
    );
    const text = `Hola! Quiero hacer este pedido:\n\n${lines.join("\n")}\n\nTotal: BOB ${totalPrice}`;
    return encodeURIComponent(text);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center gap-1.5 bg-brown-dark hover:bg-ink text-cream font-semibold text-sm p-2.5 sm:px-3.5 sm:py-2 rounded-full transition-colors"
      >
        <ShoppingBag className="w-4 h-4 sm:hidden" />
        <span className="hidden sm:inline">Carrito</span>
        {totalItems > 0 && (
          <span className="bg-green text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[95] flex justify-end h-dvh">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-cream h-dvh flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-brown/15">
              <h2 className="font-display font-semibold text-lg text-brown-dark">
                Tu carrito
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-ink/60 hover:text-ink text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <p className="text-ink/50 text-sm text-center mt-10">
                  Todavía no agregaste productos
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}`}
                      className="bg-white rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-ink truncate">
                          {item.name}
                        </p>
                        {item.color && (
                          <p className="text-xs text-ink/50">{item.color}</p>
                        )}
                        <p className="text-sm text-brown-dark font-semibold">
                          BOB {item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            updateQty(item.productId, item.color, item.qty - 1)
                          }
                          className="w-6 h-6 rounded-full bg-cream text-ink flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <span className="text-sm w-4 text-center">{item.qty}</span>
                        <button
                          onClick={() =>
                            updateQty(item.productId, item.color, item.qty + 1)
                          }
                          className="w-6 h-6 rounded-full bg-cream text-ink flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.color)}
                          className="text-red-400 text-xs ml-1"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-brown/15">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-display font-semibold text-brown-dark text-xl">
                    BOB {totalPrice}
                  </span>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsappMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-green hover:bg-green-dark text-white font-semibold py-3 rounded-full transition-colors mb-2"
                >
                  Enviar pedido por WhatsApp
                </a>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-ink/50 text-sm py-1"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
