"use client";

import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Truck, AtSign, Clock, Tag, Plus, X, DollarSign, FileCheck, Save, Check, Pencil } from "lucide-react";
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

function CategoriesManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  async function addCategory() {
    if (!newName.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const created = await res.json();
      setCategories((c) => [...c, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      showToast("Categoría creada", "success");
    } else {
      showToast("Esa categoría ya existe", "error");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    await fetch(`/api/admin/categories/${toDelete.id}`, { method: "DELETE" });
    setCategories((c) => c.filter((cat) => cat.id !== toDelete.id));
    showToast("Categoría borrada", "success");
    setToDelete(null);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.name);
  }

  async function saveEdit(id: string) {
    if (!editValue.trim()) return;
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });

    if (res.ok) {
      const updated = await res.json();
      setCategories((c) =>
        c.map((cat) => (cat.id === id ? updated : cat)).sort((a, b) => a.name.localeCompare(b.name))
      );
      showToast("Categoría actualizada, productos sincronizados", "success");
      setEditingId(null);
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo actualizar", "error");
    }
  }

  return (
    <SectionCard icon={Tag} title="Categorías">
      <div className="flex gap-2 mb-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría"
          className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
        />
        <button
          type="button"
          onClick={addCategory}
          className="bg-brown-dark text-white w-10 rounded-xl flex items-center justify-center shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {!loading && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) =>
            editingId === c.id ? (
              <div key={c.id} className="flex items-center gap-1 bg-white border border-brown/20 rounded-full pl-3 pr-1.5 py-1">
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                  className="text-sm outline-none w-24"
                />
                <button onClick={() => saveEdit(c.id)} className="text-green-dark text-xs font-semibold px-1.5">
                  Guardar
                </button>
                <button onClick={() => setEditingId(null)} className="text-ink/30 hover:text-red-400 px-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                key={c.id}
                onClick={() => startEdit(c)}
                className="flex items-center gap-1.5 bg-cream hover:bg-cream/70 rounded-full pl-3 pr-2 py-1.5 text-sm transition-colors"
              >
                {c.name}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setToDelete(c);
                  }}
                  className="text-ink/30 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              </button>
            )
          )}
        </div>
      )}
      <p className="text-[11px] text-ink/40 mt-2">Toca una categoría para editarla</p>
      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar categoría?"
        message={toDelete ? `Los productos con la categoría "${toDelete.name}" no se borrarán, pero quedarán sin categoría asignada.` : ""}
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
    <SectionCard icon={AtSign} title="Redes sociales">
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
        <CategoriesManager />
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
