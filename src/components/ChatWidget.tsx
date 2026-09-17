"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: "¡Hola! 👋 Soy el asistente de Bebitos. Preguntame por precios, stock o cualquier producto de la tienda.",
};

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
  }, [messages, open]);

  if (pathname?.startsWith("/admin")) return null;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "No pude responder, intenta de nuevo." },
        ]);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Hubo un problema de conexión. Intenta de nuevo en un momento." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[520px] bg-cream rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-brown/10">
          <div className="bg-brown-dark px-4 py-3.5 flex items-center justify-between shrink-0">
            <div>
              <p className="text-cream font-semibold text-sm">Asistente Bebitos</p>
              <p className="text-cream/60 text-[11px]">Responde en segundos</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-cream/70 hover:text-cream p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    m.role === "user"
                      ? "bg-brown-dark text-cream rounded-br-sm"
                      : "bg-white text-ink rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-brown-dark/50 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.startsWith("591") ? whatsapp : "591" + whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-green-dark bg-green/10 hover:bg-green/20 rounded-full py-1.5 transition-colors shrink-0"
            >
              Prefiero hablar por WhatsApp
            </a>
          )}

          <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 pt-0 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="flex-1 border border-brown/15 rounded-full px-4 py-2.5 text-sm outline-none focus:border-brown/40 bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Enviar"
              className="w-10 h-10 rounded-full bg-brown-dark text-cream flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="w-14 h-14 rounded-full bg-brown-dark text-cream shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
