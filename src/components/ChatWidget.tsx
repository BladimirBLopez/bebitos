"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  X,
  Send,
  Loader2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const CLOUD_NAME = "dkq95jus0";

type ChatProduct = {
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number | null;
  isPromo: boolean;
  showPrice: boolean;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  time: string;
  products?: ChatProduct[];
  hasMore?: boolean;
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
    "¡Hola! 👋 ¿Qué estás buscando para tu bebé?",
  time: nowLabel(),
};

function WhatsAppIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
    >
      <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.38 1.63 6.22L3.2 28.8l6.77-1.6a12.73 12.73 0 0 0 6.03 1.53h.01c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.73-12.81-12.73zm0 23.15h-.01a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-3.99.94.95-3.88-.25-.4a10.44 10.44 0 0 1-1.6-5.57c0-5.79 4.7-10.5 10.49-10.5 2.8 0 5.43 1.1 7.41 3.08a10.4 10.4 0 0 1 3.08 7.42c0 5.79-4.71 10.61-10.34 10.61z" />
    </svg>
  );
}

function getImageUrl(image: string) {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_180,h_180,c_fill,f_auto,q_auto/${image}`;
}

function formatPrice(price: number) {
  return `Bs. ${Number(price).toFixed(0)}`;
}

function StoreLogoBadge() {
  return (
    <div className="h-10 min-w-[86px] px-3 rounded-2xl bg-[#F8F2EA] border border-white/20 flex items-center justify-center shadow-sm">
      <span className="font-display text-[20px] leading-none font-semibold text-[#B58B72] tracking-tight">
        Bebitos
      </span>
    </div>
  );
}

export default function ChatWidget() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] =
    useState<Message[]>([GREETING]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((res) => res.json())
      .then((data) =>
        setWhatsapp(data.whatsapp || "")
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;

    const bodyOverflow =
      document.body.style.overflow;

    const htmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow =
        htmlOverflow;
    };
  }, [open]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  function whatsappUrl() {
    if (!whatsapp) return "#";

    const number = whatsapp.startsWith("591")
      ? whatsapp
      : `591${whatsapp}`;

    return `https://wa.me/${number}?text=${encodeURIComponent(
      "Hola Bebitos 👋 Vengo desde el asistente de la tienda y quisiera recibir ayuda."
    )}`;
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages.map(
            ({ role, content }) => ({
              role,
              content,
            })
          ),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              data.error ||
              "No pude responder. Intenta nuevamente.",
            time: nowLabel(),
          },
        ]);

        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply,
          time: nowLabel(),
          products: Array.isArray(data.products)
            ? data.products
            : [],
          hasMore: Boolean(data.hasMore),
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Hubo un problema de conexión. Intenta nuevamente.",
          time: nowLabel(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendMessage(
    event: React.FormEvent
  ) {
    event.preventDefault();
    sendText(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[58dvh] min-h-[420px] max-h-[500px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 flex flex-col overflow-hidden">

          {/* CABECERA */}
          <div className="bg-[#008069] px-4 py-3 flex items-center gap-3 shrink-0">
            <StoreLogoBadge />

            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">
                Asistente Bebitos
              </p>

              <p className="text-white/75 text-[11px] mt-0.5">
                Asistente virtual
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

          {/* CONVERSACIÓN */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3"
            style={{
              backgroundColor: "#E9E2DC",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className="space-y-2"
              >
                {/* MENSAJE */}
                <div
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-2xl shadow-sm ${
                      message.role === "user"
                        ? "bg-[#D9FDD3] rounded-tr-sm"
                        : "bg-white rounded-tl-sm"
                    }`}
                  >
                    <p className="text-[13px] leading-snug text-[#111b21] whitespace-pre-line">
                      {message.content}
                    </p>

                    <p className="text-[9px] text-black/30 text-right mt-1">
                      {message.time}
                    </p>
                  </div>
                </div>

                {/* PRODUCTOS */}
                {message.role === "assistant" &&
                  message.products &&
                  message.products.length > 0 && (
                    <div className="max-w-[94%] bg-white rounded-2xl shadow-sm border border-black/[0.04] overflow-hidden">

                      <div className="px-3 py-2 flex items-center gap-1.5 border-b border-black/[0.05]">
                        <Sparkles className="w-3.5 h-3.5 text-[#008069]" />

                        <span className="text-[10px] uppercase tracking-wide font-bold text-[#008069]">
                          Recomendados
                        </span>
                      </div>

                      <div className="divide-y divide-black/[0.06]">
                        {message.products.map(
                          (product) => (
                            <a
                              key={product.slug}
                              href={`/producto/${product.slug}`}
                              className="flex items-center gap-3 p-2.5 active:bg-black/[0.035]"
                            >
                              {/* FOTO */}
                              <div className="relative w-[58px] h-[58px] rounded-xl overflow-hidden bg-[#F7F3EC] shrink-0">
                                {product.image ? (
                                  <img
                                    src={getImageUrl(
                                      product.image
                                    )}
                                    alt={
                                      product.name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-black/25 text-center">
                                    Sin foto
                                  </div>
                                )}

                                {product.isPromo && (
                                  <span className="absolute top-1 left-1 bg-[#7FBF2D] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                                    OFERTA
                                  </span>
                                )}
                              </div>

                              {/* INFO */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] leading-[1.25] font-semibold text-[#29211D] line-clamp-2">
                                  {product.name}
                                </p>

                                <div className="flex items-baseline gap-1.5 mt-1.5">
                                  {product.showPrice ? (
                                    <>
                                      <span className="text-[14px] font-bold text-[#008069]">
                                        {formatPrice(
                                          product.price
                                        )}
                                      </span>

                                      {product.originalPrice && (
                                        <span className="text-[9px] text-black/30 line-through">
                                          {formatPrice(
                                            product.originalPrice
                                          )}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-semibold text-[#008069]">
                                      Consultar precio
                                    </span>
                                  )}
                                </div>

                                <span className="inline-block text-[9px] text-[#629A42] font-medium mt-0.5">
                                  Disponible
                                </span>
                              </div>

                              <div className="w-7 h-7 rounded-full bg-[#008069]/[0.08] flex items-center justify-center shrink-0">
                                <ChevronRight className="w-4 h-4 text-[#008069]" />
                              </div>
                            </a>
                          )
                        )}
                      </div>

                      {message.hasMore && (
                        <button
                          type="button"
                          onClick={() =>
                            sendText(
                              "Muéstrame más opciones"
                            )
                          }
                          className="w-full py-2.5 text-[11px] font-bold text-[#008069] bg-[#008069]/[0.045] border-t border-black/[0.04]"
                        >
                          Ver más opciones
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}

            {/* ATAJOS SOLO AL INICIO */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Ofertas",
                  "Alimentación",
                  "Accesorios",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      sendText(option)
                    }
                    className="bg-white text-[#008069] text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[#008069]/15 shadow-sm"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#008069]" />
                </div>
              </div>
            )}
          </div>

          {/* WHATSAPP HUMANO */}
          {whatsapp && (
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mt-2 px-3 py-2.5 rounded-2xl bg-white border border-[#25D366]/20 shadow-sm flex items-center justify-between gap-3 shrink-0 hover:bg-[#FAFFFB] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-4.5 h-4.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#111b21] leading-tight">
                    Hablar con una persona
                  </p>
                  <p className="text-[10px] text-[#008069]/80 leading-tight mt-0.5">
                    Atención por WhatsApp
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#25D366]/12 flex items-center justify-center shrink-0">
                <ChevronRight className="w-4 h-4 text-[#008069]" />
              </div>
            </a>
          )}

          {/* INPUT */}
          <form
            onSubmit={sendMessage}
            className="p-2.5 flex items-center gap-2 bg-[#F0F2F5] shrink-0"
          >
            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Escribe un mensaje"
              disabled={loading}
              className="flex-1 min-w-0 bg-white rounded-full px-4 py-2.5 text-sm outline-none border-none"
            />

            <button
              type="submit"
              disabled={
                loading || !input.trim()
              }
              aria-label="Enviar"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN CERRADO */}
      {!open && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="bg-white text-[#29211D] text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-lg ring-1 ring-black/5"
          >
            ¿Te ayudo en algo?
          </button>

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir chat"
            className="w-16 h-16 rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(0,0,0,0.28)] ring-4 ring-white flex items-center justify-center"
          >
            <WhatsAppIcon className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}
