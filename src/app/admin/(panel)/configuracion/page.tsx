"use client";

import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Truck, Clock, Plus, DollarSign, Save, Check, Pencil } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import ToggleSwitch from "@/components/ToggleSwitch";
import SocialLinkModal from "@/components/SocialLinkModal";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S5 18 5 14.8s2.6-5.7 5.8-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.7Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.1c0-.8.2-1.3 1.4-1.3h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2h-2.5v2.8h2.5V21h3Z" />
    </svg>
  ),
};

type SettingsData = {
  whatsapp: string;
  mapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  shippingText: string;
  businessHours: string;
  showPrices: boolean;
  qualityReportUrl: string;
};

type Category = { id: string; name: string };

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
    <div className="bg-white rounded-2xl border border-brown/10 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
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

function SocialGrid({
  form,
  setForm,
}: {
  form: SettingsData;
  setForm: React.Dispatch<React.SetStateAction<SettingsData | null>>;
}) {
  const [openPlatform, setOpenPlatform] = useState<null | "Instagram" | "Facebook" | "TikTok">(null);

  const platforms: { name: "Instagram" | "Facebook" | "TikTok"; field: keyof SettingsData }[] = [
    { name: "Instagram", field: "instagramUrl" },
    { name: "Facebook", field: "facebookUrl" },
    { name: "TikTok", field: "tiktokUrl" },
  ];

  function handleSave(field: keyof SettingsData, value: string) {
    setForm((f) => f && { ...f, [field]: value });
    setOpenPlatform(null);
  }

  return (
    <SectionCard icon={MessageCircle} title="Contacto y redes">
      <label className="text-xs font-medium text-ink/60 block mb-1">
        WhatsApp (con código de país, sin espacios ni +)
      </label>
      <input
        value={form.whatsapp}
        onChange={(e) => setForm((f) => f && { ...f, whatsapp: e.target.value })}
        className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40 mb-4"
        placeholder="59169501208"
      />
      <p className="text-xs font-medium text-ink/60 mb-2">Redes sociales</p>
      <div className="grid grid-cols-3 gap-3">
        {platforms.map((p) => {
          const hasValue = !!(form[p.field] as string)?.trim();
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setOpenPlatform(p.name)}
              className="relative flex flex-col items-center gap-1.5 border border-brown/15 hover:border-brown/30 rounded-xl py-3 transition-colors"
            >
              <span className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-brown-dark">
                {SOCIAL_ICONS[p.name]}
              </span>
              <span className="text-xs text-ink/70">{p.name}</span>
              <span
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                  hasValue ? "bg-green text-white" : "bg-brown-dark/10 text-brown-dark"
                }`}
              >
                {hasValue ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </span>
              {hasValue && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-brown/15 flex items-center justify-center text-brown-dark/50">
                  <Pencil className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {platforms.map((p) => (
        <SocialLinkModal
          key={p.name}
          open={openPlatform === p.name}
          platform={p.name}
          currentUrl={(form[p.field] as string) || ""}
          onSave={(url) => handleSave(p.field, url)}
          onClose={() => setOpenPlatform(null)}
        />
      ))}
    </SectionCard>
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
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo guardar", "error");
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl mt-4">
        <p className="text-xs font-semibold text-brown-dark/50 uppercase tracking-wide mt-2">
          Contacto y redes
        </p>
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

        <SectionCard icon={Clock} title="Horario de atención">
          <input
            value={form.businessHours}
            onChange={(e) => setForm((f) => f && { ...f, businessHours: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
            placeholder="Lun a Sáb, 9:00 - 19:00"
          />
        </SectionCard>

        <SocialGrid form={form} setForm={setForm} />

        <p className="text-xs font-semibold text-brown-dark/50 uppercase tracking-wide mt-3">
          Configuración de la tienda
        </p>
        <SectionCard icon={Truck} title="Texto de envíos">
          <input
            value={form.shippingText}
            onChange={(e) => setForm((f) => f && { ...f, shippingText: e.target.value })}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
            placeholder="Envios a nivel nacional"
          />
        </SectionCard>

        <SectionCard icon={DollarSign} title="Precios">
          <ToggleSwitch
            checked={form.showPrices}
            onChange={(v) => setForm((f) => f && { ...f, showPrices: v })}
            label="Mostrar precios en la tienda"
            description="Si lo apagas, los clientes tendran que consultar el precio por WhatsApp"
          />
        </SectionCard>

        <div className="h-16" />
        <div className="fixed bottom-0 left-0 right-0 sm:left-56 bg-white border-t border-brown/10 p-3 z-30">
          <button
            type="submit"
            disabled={saving}
            className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}