export default function TrustBar({ shippingText }: { shippingText?: string }) {
  const items = [
    shippingText || "Envíos a nivel nacional 🇧🇴",
    "Productos 100% seguros",
    "Atención por WhatsApp",
  ];

  return (
    <div className="bg-brown-dark/95 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-6 flex-wrap">
        {items.map((item) => (
          <span key={item} className="text-cream/85 text-xs font-medium whitespace-nowrap">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
