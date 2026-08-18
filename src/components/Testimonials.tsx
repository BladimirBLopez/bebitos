const REVIEWS = [
  { name: "Camila R.", text: "Excelente calidad y atención súper rápida por WhatsApp. Mi bebé ama sus productos." },
  { name: "Daniela M.", text: "Los pedidos llegan bien empacados y a tiempo. Ya es mi tienda de confianza." },
  { name: "Andrea S.", text: "Productos seguros y bonitos. Se nota el cuidado en cada detalle." },
];

export default function Testimonials() {
  return (
    <section className="bg-white/50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-display text-xl font-semibold text-brown-dark mb-5 text-center">
          Mamás que confían en Bebitos 🤎
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-5 border border-brown/10">
              <div className="text-green mb-2 text-sm">★★★★★</div>
              <p className="text-ink/70 text-sm mb-3">&ldquo;{r.text}&rdquo;</p>
              <p className="text-brown-dark text-sm font-semibold">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
