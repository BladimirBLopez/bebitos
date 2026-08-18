import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat({ whatsapp }: { whatsapp?: string }) {
  const number = whatsapp || "59169501208";

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-[55] bg-green hover:bg-green-dark text-white w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
      aria-label="Escribinos por WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
