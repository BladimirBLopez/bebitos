"use client";

import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Truck, Clock, Plus, DollarSign, Gift, Save, Check, Pencil, X, Trash2, ChevronUp, ChevronDown, ImageOff } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import ToggleSwitch from "@/components/ToggleSwitch";
import SocialLinkModal from "@/components/SocialLinkModal";
import PageHeader from "@/components/PageHeader";

const CLOUD_NAME = "dkq95jus0";
const UPLOAD_PRESET = "bebitos_admin";

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

type GiftResource = { id: string; label: string; image: string; order: number };

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
    <div className="bg-panel-surface rounded-xl border border-panel-border p-5" style={{ boxShadow: "var(--shadow-panel)" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-8 h-8 rounded-lg bg-brown-dark/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brown-dark" />
        </span>
        <h3 className="font-sans font-semibold text-panel-ink text-sm">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function GiftResourceManager() {
  const { showToast } = useToast();
  const [resources, setResources] = useState<GiftResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [toDelete, setToDelete] = useState<GiftResource | null>(null);

  useEffect(() => {
    fetch("/api/admin/gift-resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setLoading(false);
      });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "bebitos/regalo");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Error al subir la imagen");

      const data = await res.json();
      setPendingImage(data.public_id);
      showToast("Imagen subida, ponle un nombre y agrégala", "success");
    } catch {
      showToast("No se pudo subir la imagen. Intenta de nuevo.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function addResource() {
    if (!pendingImage || !labelInput.trim()) return;

    const res = await fetch("/api/admin/gift-resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: labelInput.trim(), image: pendingImage }),
    });

    if (res.ok) {
      const created = await res.json();
      setResources((r) => [...r, created]);
      setPendingImage(null);
      setLabelInput("");
      showToast("Recurso agregado", "success");
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo agregar", "error");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await fetch(`/api/admin/gift-resources/${toDelete.id}`, { method: "DELETE" });
    setResources((r) => r.filter((res) => res.id !== toDelete.id));
    showToast("Recurso borrado", "success");
    setToDelete(null);
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= resources.length) return;

    const reordered = [...resources];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setResources(reordered);

    const items = reordered.map((r, i) => ({ id: r.id, order: i }));
    await fetch("/api/admin/gift-resources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }

  return (
    <SectionCard icon={Gift} title="Regalo descargable">
      <p className="text-[11px] text-ink/40 mb-3">
        Sube las imágenes que quieres regalar. Aparecen en <span className="font-medium">/regalo</span> con su propio botón de descarga, después de que alguien deja su nombre y WhatsApp.
      </p>

      {!loading && resources.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {resources.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2 bg-cream rounded-xl p-2">
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="w-6 h-5 rounded bg-white flex items-center justify-center text-brown-dark disabled:opacity-30"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === resources.length - 1}
                  className="w-6 h-5 rounded bg-white flex items-center justify-center text-brown-dark disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="w-12 h-12 rounded-lg bg-white shrink-0 overflow-hidden flex items-center justify-center">
                {r.image ? (
                  <img
                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_80,h_80,c_fill/${r.image}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="w-4 h-4 text-brown/25" />
                )}
              </div>
              <p className="flex-1 text-sm text-ink truncate">{r.label}</p>
              <button
                type="button"
                onClick={() => setToDelete(r)}
                className="text-red-300 hover:text-red-500 p-1.5 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-brown/10 pt-3">
        {!pendingImage ? (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-brown/20 rounded-xl py-3 text-sm text-ink/50 cursor-pointer hover:border-brown/40 transition-colors">
            {uploading ? "Subiendo..." : "+ Subir nueva imagen"}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_60,h_60,c_fill/${pendingImage}`}
              alt=""
              className="w-11 h-11 rounded-lg object-cover shrink-0"
            />
            <input
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="Nombre, ej. Checklist de alimentos"
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-brown/40"
            />
            <button
              type="button"
              onClick={addResource}
              disabled={!labelInput.trim()}
              className="bg-brown-dark text-white w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="text-ink/30 hover:text-red-400 p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar este recurso?"
        message={toDelete ? `"${toDelete.label}" dejará de aparecer en /regalo.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </SectionCard>
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
      <PageHeader
        title="Configuración"
        meta="Estos datos se usan en tu tienda y página de links"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
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

        <div className="h-32" />
        <div className="sticky bottom-0 bg-white border-t border-brown/10 p-3 z-30 mt-6 shadow-lg">
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

      <div className="max-w-xl mt-4">
        <GiftResourceManager />
      </div>
    </div>
  );
}
