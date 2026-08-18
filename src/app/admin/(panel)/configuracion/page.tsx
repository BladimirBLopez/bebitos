"use client";

import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Truck, AtSign } from "lucide-react";
import { useToast } from "@/lib/toast-context";

type SettingsData = {
  whatsapp: string;
  mapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  shippingText: string;
};

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-brown/10 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brown-dark" />
        </span>
        <h3 className="font-display font-semibold text-brown-dark text-sm">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export default function ConfiguracionPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      showToast("Configuración guardada", "success");
    } else {
      showToast("No se pudo guardar", "error");
    }
  }

  if (loading || !form) {
    return <p className="text-ink/50 text-sm">Cargando...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brown-dark mb-1">
        Configuración
      </h1>
      <p className="text-ink/50 text-sm mb-6">
        Estos datos se usan en tu tienda y página de links
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        <SectionCard icon={MessageCircle} title="WhatsApp">
          <label className="text-xs font-medium text-ink/60 block mb-1">
            Número (con código de país, sin espacios ni +)
          </label>
          <input
            value={form.whatsapp}
            onChange={(e) => setForm((f) => f && { ...f, whatsapp: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
            placeholder="59169501208"
          />
        </SectionCard>

        <SectionCard icon={MapPin} title="Ubicación">
          <label className="text-xs font-medium text-ink/60 block mb-1">
            Link de Google Maps
          </label>
          <input
            value={form.mapsUrl}
            onChange={(e) => setForm((f) => f && { ...f, mapsUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>

        <SectionCard icon={AtSign} title="Instagram">
          <input
            value={form.instagramUrl}
            onChange={(e) => setForm((f) => f && { ...f, instagramUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>

        <SectionCard icon={AtSign} title="Facebook">
          <input
            value={form.facebookUrl}
            onChange={(e) => setForm((f) => f && { ...f, facebookUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>

        <SectionCard icon={AtSign} title="TikTok">
          <input
            value={form.tiktokUrl}
            onChange={(e) => setForm((f) => f && { ...f, tiktokUrl: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </SectionCard>

        <SectionCard icon={Truck} title="Texto de envíos">
          <input
            value={form.shippingText}
            onChange={(e) => setForm((f) => f && { ...f, shippingText: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
            placeholder="Envios a nivel nacional"
          />
        </SectionCard>

        <button
          type="submit"
          disabled={saving}
          className="self-start bg-green hover:bg-green-dark text-white font-semibold px-6 py-3 rounded-full transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
