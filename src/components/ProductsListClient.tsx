"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, ImageOff, Trash2, Check } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/lib/toast-context";

const CLOUD_NAME = "dkq95jus0";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  promoPrice: number | null;
  isPromo: boolean;
  isNew: boolean;
  inStock: boolean;
  images: string[];
};

type Category = { id: string; name: string };

export default function ProductsListClient({
  products,
  allCategories = [],
}: {
  products: ProductRow[];
  allCategories?: Category[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [toDelete, setToDelete] = useState<ProductRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"eliminar" | null>(null);

  const categories = ["Todas", ...allCategories.map((c) => c.name)];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Todas" || p.category === category;
    return matchesSearch && matchesCategory;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(action: "activar" | "desactivar" | "eliminar") {
    const ids = Array.from(selected);
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });

    setBulkAction(null);
    if (res.ok) {
      showToast(`${ids.length} producto(s) actualizado(s)`, "success");
      setSelected(new Set());
      router.refresh();
    } else {
      showToast("No se pudo completar la acción", "error");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    const res = await fetch(`/api/admin/products/${toDelete.id}`, { method: "DELETE" });
    setToDelete(null);

    if (res.ok) {
      showToast(`"${toDelete.name}" fue borrado`, "success");
      router.refresh();
    } else {
      showToast("No se pudo borrar el producto", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-brown-dark">
          Productos
        </h1>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-1.5 bg-green hover:bg-green-dark text-white font-semibold text-sm px-4 py-2.5 rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full bg-white border border-brown/15 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 bg-brown-dark rounded-xl px-4 py-2.5 mb-3 flex-wrap">
          <span className="text-cream text-sm font-medium mr-1">
            {selected.size} seleccionado(s)
          </span>
          <button
            onClick={() => runBulk("activar")}
            className="bg-cream/15 hover:bg-cream/25 text-cream text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            Activar
          </button>
          <button
            onClick={() => runBulk("desactivar")}
            className="bg-cream/15 hover:bg-cream/25 text-cream text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            Desactivar
          </button>
          <button
            onClick={() => setBulkAction("eliminar")}
            className="bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-ink/50 text-sm text-center py-10">
          No se encontraron productos.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <div
                key={p.id}
                className={`bg-white rounded-xl p-3 flex items-center gap-3 hover:shadow-sm transition-shadow group ${
                  isSelected ? "ring-2 ring-brown-dark/30" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSelect(p.id)}
                  className={`w-5 h-5 rounded-md border shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? "bg-brown-dark border-brown-dark" : "border-brown/25"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                <div className="w-14 h-14 rounded-lg bg-cream shrink-0 overflow-hidden flex items-center justify-center">
                  {p.images.length > 0 ? (
                    <img
                      src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_100,h_100,c_fill/${p.images[0]}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff className="w-5 h-5 text-brown/25" />
                  )}
                </div>

                <Link href={`/admin/productos/${p.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-xs text-ink/50">{p.category}</span>
                    {p.isNew && (
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full">
                        🆕 Nuevo
                      </span>
                    )}
                    {p.isPromo && (
                      <span className="text-[10px] font-semibold bg-green/15 text-green-dark px-1.5 py-0.5 rounded-full">
                        🔥 Oferta
                      </span>
                    )}
                    {!p.inStock && (
                      <span className="text-[10px] font-semibold bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                        😔 Agotado
                      </span>
                    )}
                  </div>
                </Link>

                <div className="text-right shrink-0">
                  {p.isPromo && p.promoPrice ? (
                    <div>
                      <span className="text-xs text-red-400 line-through block">
                        BOB {p.price}
                      </span>
                      <span className="font-semibold text-green">
                        BOB {p.promoPrice}
                      </span>
                    </div>
                  ) : (
                    <span className="font-semibold text-brown-dark">
                      BOB {p.price}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setToDelete(p)}
                  className="opacity-0 group-hover:opacity-100 sm:opacity-100 text-red-300 hover:text-red-500 transition-colors p-1.5 shrink-0"
                  title="Borrar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar producto?"
        message={toDelete ? `Esta acción no se puede deshacer. "${toDelete.name}" se eliminará permanentemente.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      <ConfirmModal
        open={!!bulkAction}
        title={`¿Borrar ${selected.size} producto(s)?`}
        message="Esta acción no se puede deshacer."
        onConfirm={() => runBulk("eliminar")}
        onCancel={() => setBulkAction(null)}
      />
    </div>
  );
}
