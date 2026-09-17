"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; time: string };

function nowLabel() {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

const GREETING: Message = {
  role: "assistant",
  content: "¡Hola! 👋 Soy el asistente de Bebitos. Preguntame por precios, stock o cualquier producto de la tienda.",
  time: nowLabel(),
};

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.26.6 4.38 1.63 6.22L3.2 28.8l6.77-1.6a12.73 12.73 0 0 0 6.03 1.53h.01c7.07 0 12.8-5.73 12.8-12.8s-5.73-12.73-12.81-12.73zm0 23.15h-.01a10.5 10.5 0 0 1-5.36-1.47l-.38-.23-3.99.94.95-3.88-.25-.4a10.44 10.44 0 0 1-1.6-5.57c0-5.79 4.7-10.5 10.49-10.5 2.8 0 5.43 1.1 7.41 3.08a10.4 10.4 0 0 1 3.08 7.42c0 5.79-4.71 10.61-10.34 10.61zm5.75-7.85c-.32-.16-1.87-.92-2.16-1.03-.29-.1-.5-.16-.71.16-.21.32-.81 1.03-1 1.24-.18.21-.37.24-.68.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.76.75.32 1.34.51 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.6-.37z" />
    </svg>
  );
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  if (pathname?.startsWith("/admin")) return null;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text, time: nowLabel() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "No pude responder, intenta de nuevo.", time: nowLabel() },
        ]);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: data.reply, time: nowLabel() }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Hubo un problema de conexión. Intenta de nuevo en un momento.", time: nowLabel() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[75dvh] max-h-[560px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 flex flex-col overflow-hidden">
          <div className="bg-[#008069] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">Asistente Bebitos</p>
              <p className="text-white/75 text-[11px] leading-tight">en línea</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-white/85 hover:text-white p-1 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1.5"
            style={{ backgroundColor: "#E5DDD5" }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm leading-snug shadow-sm ${
                    m.role === "user"
                      ? "bg-[#D9FDD3] text-[#111b21] rounded-tr-none"
                      : "bg-white text-[#111b21] rounded-tl-none"
                  }`}
                >
                  <p>{m.content}</p>
                  <p
                    className={`text-[10px] mt-0.5 text-right ${
                      m.role === "user" ? "text-[#4a7a3a]/70" : "text-black/40"
                    }`}
                  >
                    {m.time}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg rounded-tl-none px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-black/40 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.startsWith("591") ? whatsapp : "591" + whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#008069] bg-[#25D366]/15 hover:bg-[#25D366]/25 rounded-full py-1.5 transition-colors shrink-0"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              Prefiero hablar por WhatsApp
            </a>
          )}

          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 p-2.5 shrink-0"
            style={{ backgroundColor: "#F0F2F5" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje"
              disabled={loading}
              className="flex-1 border-none rounded-full px-4 py-2.5 text-sm outline-none bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="w-16 h-16 rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] ring-4 ring-white flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="w-7 h-7" /> : <WhatsAppIcon className="w-8 h-8" />}
      </button>
    </div>
  );
}
