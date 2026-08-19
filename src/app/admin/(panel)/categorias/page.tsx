"use client";

import { useEffect, useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";

type Category = { id: string; name: string };

export default function CategoriasPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);

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

  async function confirmDelete() {
    if (!toDelete) return;
    await fetch(`/api/admin/categories/${toDelete.id}`, { method: "DELETE" });
    setCategories((c) => c.filter((cat) => cat.id !== toDelete.id));
    showToast("Categoría borrada", "success");
    setToDelete(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brown-dark mb-1">
        Categorías
      </h1>
      <p className="text-ink/50 text-sm mb-6">
        Organiza tus productos por categoría
      </p>

      <div className="bg-white rounded-2xl border border-brown/10 p-5 max-w-xl" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="Nueva categoría"
            className="flex-1 border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40"
          />
          <button
            type="button"
            onClick={addCategory}
            className="bg-green hover:bg-green-dark text-white px-4 rounded-xl flex items-center gap-1.5 text-sm font-semibold shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear
          </button>
        </div>

        {loading ? (
          <p className="text-ink/40 text-sm">Cargando...</p>
        ) : categories.length === 0 ? (
          <p className="text-ink/40 text-sm text-center py-6">Todavía no hay categorías</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {categories.map((c) =>
              editingId === c.id ? (
                <div key={c.id} className="flex items-center gap-1 bg-cream rounded-xl px-3 py-2">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                    className="flex-1 text-sm outline-none bg-transparent"
                  />
                  <button onClick={() => saveEdit(c.id)} className="text-green-dark text-xs font-semibold px-2">
                    Guardar
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-ink/30 hover:text-red-400 px-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div key={c.id} className="flex items-center justify-between bg-cream rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-brown-dark/40" />
                    <span className="text-sm text-ink">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => startEdit(c)} className="text-brown-dark/60 hover:text-brown-dark text-xs font-medium">
                      Editar
                    </button>
                    <button onClick={() => setToDelete(c)} className="text-red-300 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar categoría?"
        message={toDelete ? `Los productos con "${toDelete.name}" quedarán sin categoría asignada.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
