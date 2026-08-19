"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Info,
  Tag,
  Palette,
  Camera,
  DollarSign,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import CategoryManagerModal from "./CategoryManagerModal";
import { useToast } from "@/lib/toast-context";

const CLOUD_NAME = "dkq95jus0";
const UPLOAD_PRESET = "bebitos_admin";

type ColorInput = { name: string; hex: string };
type Category = { id: string; name: string };
type StatusOption = "normal" | "nuevo" | "agotado" | "oferta";

type ProductFormData = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  category: string;
  colors: ColorInput[];
  images: string[];
  inStock: boolean;
  isPromo: boolean;
  isNew: boolean;
  promoPrice: string;
};

const empty: ProductFormData = {
  slug: "",
  name: "",
  description: "",
  features: [],
  price: "",
  category: "",
  colors: [],
  images: [],
  inStock: true,
  isPromo: false,
  isNew: false,
  promoPrice: "",
};

function getStatus(f: ProductFormData): StatusOption {
  if (!f.inStock) return "agotado";
  if (f.isPromo) return "oferta";
  if (f.isNew) return "nuevo";
  return "normal";
}

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

const STATUS_OPTIONS: { value: StatusOption; label: string; emoji: string }[] = [
  { value: "normal", label: "Normal", emoji: "" },
  { value: "nuevo", label: "Nuevo", emoji: "🆕" },
  { value: "agotado", label: "Agotado", emoji: "😔" },
  { value: "oferta", label: "Oferta", emoji: "🔥" },
];

export default function ProductForm({
  initial,
}: {
  initial?: Partial<ProductFormData>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<ProductFormData>({ ...empty, ...initial });
  const [categories, setCategories] = useState<Category[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#85BF35");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        if (!form.category && data.length > 0) {
          setForm((f) => ({ ...f, category: data[0].name }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function update(patch: Partial<ProductFormData>) {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string) {
    update({ name, slug: form.id ? form.slug : slugify(name) });
  }

  function setStatus(status: StatusOption) {
    update({
      inStock: status !== "agotado",
      isPromo: status === "oferta",
      isNew: status === "nuevo",
    });
  }

  function addFeature() {
    if (!featureInput.trim()) return;
    update({ features: [...form.features, featureInput.trim()] });
    setFeatureInput("");
  }

  function removeFeature(i: number) {
    update({ features: form.features.filter((_, idx) => idx !== i) });
  }

  function addColor() {
    if (!colorName.trim()) return;
    update({ colors: [...form.colors, { name: colorName.trim(), hex: colorHex }] });
    setColorName("");
  }

  function removeColor(i: number) {
    update({ colors: form.colors.filter((_, idx) => idx !== i) });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "bebitos");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Error al subir la imagen");

      const data = await res.json();
      update({ images: [...form.images, data.public_id] });
      showToast("Foto subida correctamente", "success");
    } catch {
      showToast("No se pudo subir la imagen. Intenta de nuevo.", "error");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    update({ images: form.images.filter((_, idx) => idx !== i) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = form.id
      ? `/api/admin/products/${form.id}`
      : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo guardar. Revisa los datos.", "error");
      return;
    }

    setDirty(false);
    showToast(form.id ? "Producto actualizado" : "Producto creado", "success");
    router.push("/admin/productos");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;
    setConfirmDelete(false);
    await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
    setDirty(false);
    showToast("Producto borrado", "success");
    router.push("/admin/productos");
    router.refresh();
  }

  function handleBack() {
    if (dirty) {
      setUnsavedWarning(true);
    } else {
      router.push("/admin/productos");
    }
  }

  const status = getStatus(form);

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        className="text-sm text-brown-dark/60 hover:text-brown-dark mb-4"
      >
        ← Volver a productos
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        <SectionCard icon={Info} title="Información básica">
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Nombre del producto
              </label>
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Descripción
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              >
                {categories.length === 0 && <option value="">Sin categorías</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="text-[11px] text-brown-dark/70 hover:text-brown-dark underline mt-1"
              >
                Gestionar categorías
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Tag} title="Características">
          <div className="flex gap-2 mb-3">
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              placeholder="Ej: Silicona 100% segura"
            />
            <button
              type="button"
              onClick={addFeature}
              className="bg-brown-dark text-white w-10 rounded-xl flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {form.features.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2 text-sm">
                {f}
                <button type="button" onClick={() => removeFeature(i)} className="text-ink/30 hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Palette} title="Colores disponibles">
          <div className="flex gap-2 mb-3 items-center">
            <input
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              placeholder="Ej: Verde"
            />
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-11 h-11 rounded-xl shrink-0"
            />
            <button
              type="button"
              onClick={addColor}
              className="bg-brown-dark text-white w-10 h-11 rounded-xl flex items-center justify-center shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-cream rounded-full pl-1 pr-2.5 py-1 text-sm">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                {c.name}
                <button type="button" onClick={() => removeColor(i)} className="text-ink/30 hover:text-red-400 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Camera} title="Fotos">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-brown/20 rounded-xl py-4 text-sm text-ink/50 cursor-pointer hover:border-brown/40 transition-colors">
            <Camera className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Toca para subir una foto"}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
          </label>
          <p className="text-[11px] text-ink/40 mt-2">
            📐 Para mejor apariencia sube fotos cuadradas (1:1) — evita fotos horizontales.
          </p>
          <div className="flex gap-2 flex-wrap mt-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${img}`}
                  alt=""
                  className="w-16 h-16 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-400 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={DollarSign} title="Precio">
          <div className="mb-4">
            <label className="text-xs font-medium text-ink/60 block mb-1">
              Precio (BOB)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update({ price: e.target.value })}
              className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              required
            />
          </div>

          <label className="text-xs font-medium text-ink/60 block mb-2">
            Estado del producto
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                  status === opt.value
                    ? "bg-brown-dark text-white border-brown-dark"
                    : "bg-cream text-ink/70 border-brown/15 hover:border-brown/30"
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>

          {status === "oferta" && (
            <div>
              <label className="text-xs font-medium text-ink/60 block mb-1">
                Precio de oferta (BOB)
              </label>
              <input
                type="number"
                value={form.promoPrice}
                onChange={(e) => update({ promoPrice: e.target.value })}
                className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
              />
            </div>
          )}
        </SectionCard>

        <div className="h-16" />
        <div className="fixed bottom-0 left-0 right-0 sm:left-56 bg-white border-t border-brown/10 p-3 z-30">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-green hover:bg-green-dark text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar producto"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-500 text-sm font-medium shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Borrar
              </button>
            )}
          </div>
        </div>
      </form>

      <ConfirmModal
        open={confirmDelete}
        title="¿Borrar este producto?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <CategoryManagerModal
        open={categoryModalOpen}
        categories={categories}
        setCategories={setCategories}
        onSelect={(name) => {
          update({ category: name });
          setCategoryModalOpen(false);
        }}
        onClose={() => setCategoryModalOpen(false)}
      />

      <ConfirmModal
        open={unsavedWarning}
        title="Cambios sin guardar"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Salir sin guardar"
        danger={false}
        onConfirm={() => router.push("/admin/productos")}
        onCancel={() => setUnsavedWarning(false)}
      />
    </>
  );
}
