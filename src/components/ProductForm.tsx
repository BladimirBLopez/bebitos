"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLOUD_NAME = "dkq95jus0";
const UPLOAD_PRESET = "bebitos_admin";
const CATEGORIES = ["Alimentacion", "Cuidado", "Accesorios", "Otros"];

type ColorInput = { name: string; hex: string };

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
  promoPrice: string;
};

const empty: ProductFormData = {
  slug: "",
  name: "",
  description: "",
  features: [],
  price: "",
  category: CATEGORIES[0],
  colors: [],
  images: [],
  inStock: true,
  isPromo: false,
  promoPrice: "",
};

export default function ProductForm({
  initial,
}: {
  initial?: Partial<ProductFormData>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>({ ...empty, ...initial });
  const [featureInput, setFeatureInput] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#85BF35");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: f.id ? f.slug : slugify(name) }));
  }

  function addFeature() {
    if (!featureInput.trim()) return;
    setForm((f) => ({ ...f, features: [...f.features, featureInput.trim()] }));
    setFeatureInput("");
  }

  function removeFeature(i: number) {
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  }

  function addColor() {
    if (!colorName.trim()) return;
    setForm((f) => ({
      ...f,
      colors: [...f.colors, { name: colorName.trim(), hex: colorHex }],
    }));
    setColorName("");
  }

  function removeColor(i: number) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

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
      setForm((f) => ({ ...f, images: [...f.images, data.public_id] }));
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(i: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

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
      setError("No se pudo guardar. Revisa los datos.");
      return;
    }

    router.push("/admin/productos");
    router.refresh();
  }

  async function handleDelete() {
    if (!form.id) return;
    if (!confirm("¿Seguro que quieres borrar este producto?")) return;
    await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
    router.push("/admin/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
      <div>
        <label className="text-sm font-semibold text-ink block mb-1">
          Nombre del producto
        </label>
        <input
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full border border-brown/20 rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-ink block mb-1">
          Descripción
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="w-full border border-brown/20 rounded-lg px-3 py-2"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-ink block mb-1">
          Categoría
        </label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full border border-brown/20 rounded-lg px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink block mb-1">
          Características
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            className="flex-1 border border-brown/20 rounded-lg px-3 py-2"
            placeholder="Ej: Silicona 100% segura"
          />
          <button
            type="button"
            onClick={addFeature}
            className="bg-brown-dark text-white px-3 rounded-lg"
          >
            +
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {form.features.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded px-3 py-1.5 text-sm">
              {f}
              <button type="button" onClick={() => removeFeature(i)} className="text-red-400">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink block mb-1">
          Colores disponibles
        </label>
        <div className="flex gap-2 mb-2 items-center">
          <input
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
            className="flex-1 border border-brown/20 rounded-lg px-3 py-2"
            placeholder="Ej: Verde"
          />
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="w-10 h-10 rounded"
          />
          <button
            type="button"
            onClick={addColor}
            className="bg-brown-dark text-white px-3 py-2 rounded-lg"
          >
            +
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {form.colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1 bg-white rounded-full pl-1 pr-2 py-1 text-sm">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: c.hex }}
              />
              {c.name}
              <button type="button" onClick={() => removeColor(i)} className="text-red-400 ml-1">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-ink block mb-1">
          Fotos
        </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-sm text-ink/50 mt-1">Subiendo...</p>}
        <div className="flex gap-2 flex-wrap mt-2">
          {form.images.map((img, i) => (
            <div key={i} className="relative">
              <img
                src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${img}`}
                alt=""
                className="w-16 h-16 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 bg-red-400 text-white w-5 h-5 rounded-full text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-semibold text-ink block mb-1">
            Precio (BOB)
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="w-full border border-brown/20 rounded-lg px-3 py-2"
            required
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
            id="inStock"
          />
          <label htmlFor="inStock" className="text-sm">Hay stock</label>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={form.isPromo}
            onChange={(e) => setForm((f) => ({ ...f, isPromo: e.target.checked }))}
            id="isPromo"
          />
          <label htmlFor="isPromo" className="text-sm font-semibold">
            Poner en promoción
          </label>
        </div>
        {form.isPromo && (
          <div>
            <label className="text-sm text-ink/70 block mb-1">
              Precio de oferta (BOB)
            </label>
            <input
              type="number"
              value={form.promoPrice}
              onChange={(e) => setForm((f) => ({ ...f, promoPrice: e.target.value }))}
              className="w-full border border-brown/20 rounded-lg px-3 py-2"
            />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-green hover:bg-green-dark text-white font-semibold px-5 py-2.5 rounded-full transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-400 text-sm"
          >
            Borrar producto
          </button>
        )}
      </div>
    </form>
  );
}
