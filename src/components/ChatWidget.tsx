"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; time: string };

function nowLabel() {
  return new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
}

const GREETING: Message = {
  role: "assistant",
  content: "¡Hola! 👋 Soy el asistente de Bebitos. Preguntame por precios, stock o cualquier producto de la tienda.",
  time: nowLabel(),
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
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[75dvh] max-h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-black/5">
          {/* Header estilo WhatsApp Business */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">Asistente Bebitos</p>
              <p className="text-white/70 text-[11px] leading-tight">en línea</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-white/80 hover:text-white p-1 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fondo de conversación tipo WhatsApp */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-1.5"
            style={{ backgroundColor: "#ECE5DD" }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-1.5 text-sm leading-snug shadow-sm ${
                    m.role === "user"
                      ? "bg-[#DCF8C6] text-[#111b21] rounded-tr-none"
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

          {/* Handoff a WhatsApp, dentro del propio chat */}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.startsWith("591") ? whatsapp : "591" + whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[#075E54] bg-[#075E54]/10 hover:bg-[#075E54]/20 rounded-full py-1.5 transition-colors shrink-0"
            >
              Prefiero hablar por WhatsApp
            </a>
          )}

          {/* Input estilo WhatsApp */}
          <form
            onSubmit={sendMessage}
            className="flex items-center gap-2 p-2.5 shrink-0"
            style={{ backgroundColor: "#F0F0F0" }}
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
        className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
