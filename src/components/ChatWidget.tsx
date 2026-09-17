"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Loader2, ChevronRight, Tag } from "lucide-react";

type ChatProduct = {
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  isPromo: boolean;
  image: string;
  category: string;
  description: string;
  stock: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  time: string;
  products?: ChatProduct[];
};

function nowLabel() {
  return new Date().toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const GREETING: Message = {
  role: "assistant",
  content:
    "¡Hola! 👋 Soy el asistente de Bebitos. ¿Qué estás buscando para tu bebé?",
  time: nowLabel(),
};

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.38 1.63 6.22L3.2 28.8l6.77-1.6a12.73 12.73 0 0 0 6.03 1.53h.01c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.73-12.81-12.73zm0 23.15h-.01a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-3.99.94.95-3.88-.25-.4a10.44 10.44 0 0 1-1.6-5.57c0-5.79 4.7-10.5 10.49-10.5 2.8 0 5.43 1.1 7.41 3.08a10.4 10.4 0 0 1 3.08 7.42c0 5.79-4.71 10.61-10.34 10.61zm5.75-7.85c-.32-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.32-.81 1.03-1 1.24-.18.21-.37.24-.68.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.76.75.32 1.34.51 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.6-.37z" />
    </svg>
  );
}

function formatPrice(value: number) {
  return `Bs. ${Number(value).toFixed(0)}`;
}

export default function ChatWidget() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((res) => res.json())
      .then((data) => setWhatsapp(data.whatsapp || ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, loading]);

  useEffect(() => {
    if (!open) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  function buildWhatsappHref(productName?: string) {
    if (!whatsapp) return "#";

    const number = whatsapp.startsWith("591")
      ? whatsapp
      : `591${whatsapp}`;

    const text = productName
      ? `Hola Bebitos 👋 Me interesa "${productName}". ¿Me brindan más información?`
      : "Hola Bebitos 👋 Quiero información sobre sus productos.";

    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  async function sendText(text: string) {
    const clean = text.trim();

    if (!clean || loading) return;

    const nextMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: clean,
        time: nowLabel(),
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error || "No pude responder. Intenta nuevamente.",
            time: nowLabel(),
          },
        ]);
        return;
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply,
          time: nowLabel(),
          products: Array.isArray(data.products) ? data.products : [],
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Hubo un problema de conexión. Intenta nuevamente.",
          time: nowLabel(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    await sendText(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[58dvh] min-h-[420px] max-h-[500px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 flex flex-col overflow-hidden">

          <div className="bg-[#008069] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <WhatsAppIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                Asistente Bebitos
              </p>
              <p className="text-white/75 text-[11px]">
                en línea
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-white/90 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3"
            style={{ backgroundColor: "#E5DDD5" }}
          >
            {messages.map((m, i) => (
              <div key={i} className="space-y-2">

                <div
                  className={`flex ${
                    m.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm leading-snug shadow-sm ${
                      m.role === "user"
                        ? "bg-[#D9FDD3] rounded-tr-sm"
                        : "bg-white rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">
                      {m.content}
                    </p>

                    <p className="text-[9px] text-black/35 mt-1 text-right">
                      {m.time}
                    </p>
                  </div>
                </div>

                {m.role === "assistant" &&
                  m.products &&
                  m.products.length > 0 && (
                    <div className="max-w-[94%] bg-white rounded-2xl shadow-sm overflow-hidden">

                      <div className="px-3 pt-3 pb-1 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#008069]" />
                        <p className="text-[11px] font-bold text-[#008069] uppercase tracking-wide">
                          Productos encontrados
                        </p>
                      </div>

                      <div className="divide-y divide-black/5">
                        {m.products.map((product, index) => (
                          <a
                            key={`${product.slug}-${index}`}
                            href={`/producto/${product.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-black/[0.02] active:bg-black/[0.04]"
                          >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f4f4f4] shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-black/30">
                                  Bebitos
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-1.5">
                                <p className="font-semibold text-[12px] leading-tight text-[#111b21] line-clamp-2">
                                  {product.name}
                                </p>

                                {product.isPromo && (
                                  <span className="shrink-0 bg-[#82c62c] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                    OFERTA
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-[13px] font-bold text-[#008069]">
                                  {formatPrice(product.price)}
                                </p>

                                {product.originalPrice && (
                                  <p className="text-[10px] text-black/30 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </p>
                                )}
                              </div>

                              <p className="text-[9px] text-[#579447] mt-0.5">
                                Disponible
                              </p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-black/25 shrink-0" />
                          </a>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#fafafa]">
                        <button
                          type="button"
                          onClick={() => sendText("Muéstrame más opciones")}
                          className="text-[11px] font-semibold bg-white border border-black/10 rounded-xl py-2"
                        >
                          Ver más
                        </button>

                        <a
                          href={buildWhatsappHref(
                            m.products.length === 1
                              ? m.products[0].name
                              : undefined
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold bg-[#25D366] text-white rounded-xl py-2 text-center flex items-center justify-center gap-1"
                        >
                          <WhatsAppIcon className="w-3 h-3" />
                          Consultar
                        </a>
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Ver ofertas",
                  "Alimentación",
                  "Accesorios",
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => sendText(label)}
                    className="bg-white border border-[#008069]/20 text-[#008069] text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-black/40 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {whatsapp && (
            <a
              href={buildWhatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#008069] bg-[#25D366]/15 rounded-full py-1.5 shrink-0"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              Hablar con una persona
            </a>
          )}

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 p-2.5 shrink-0 bg-[#F0F2F5]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje"
              disabled={loading}
              className="flex-1 min-w-0 border-none rounded-full px-4 py-2.5 text-sm outline-none bg-white"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {!open && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="bg-white text-[#111b21] text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-lg ring-1 ring-black/5"
          >
            ¿Te ayudo en algo?
          </button>

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir chat"
            className="w-16 h-16 rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] ring-4 ring-white flex items-center justify-center"
          >
            <WhatsAppIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}
