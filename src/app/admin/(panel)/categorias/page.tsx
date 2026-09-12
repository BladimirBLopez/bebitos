"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Tag, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import PageHeader from "@/components/PageHeader";

type Category = { id: string; name: string; order: number };

function EditCategoryModal({
  open,
  category,
  onSave,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onSave: (id: string, name: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (category) setValue(category.name);
  }, [category]);

  if (!category) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[90]" />
        <Dialog.Content className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl p-6 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-display font-semibold text-ink text-lg">
              Nombre de la categoría
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-ink/40 hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && value.trim() && onSave(category.id, value.trim())}
            className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40 mb-5"
          />
          <div className="flex gap-2">
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="flex-1 text-sm font-medium text-ink/70 bg-cream hover:bg-cream/70 py-2.5 rounded-full transition-colors"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={() => value.trim() && onSave(category.id, value.trim())}
              className="flex-1 text-sm font-semibold text-cream bg-brown-dark hover:bg-ink py-2.5 rounded-full transition-colors"
            >
              Guardar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function CategoriasPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
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
      setCategories((c) => [...c, created]);
      setNewName("");
      showToast("Categoría creada", "success");
    } else {
      showToast("Esa categoría ya existe", "error");
    }
  }

  async function saveEdit(id: string, name: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const updated = await res.json();
      setCategories((c) => c.map((cat) => (cat.id === id ? { ...cat, name: updated.name } : cat)));
      showToast("Categoría actualizada, productos sincronizados", "success");
      setEditing(null);
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

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setCategories(reordered);

    const items = reordered.map((c, i) => ({ id: c.id, order: i }));
    await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }

  return (
    <div>
      <PageHeader
        title="Categorías"
        meta={loading ? "Organiza tus productos por categoría" : `${categories.length} categoría${categories.length === 1 ? "" : "s"}`}
      />

      <div className="bg-panel-surface rounded-xl border border-panel-border p-5 max-w-xl mb-4" style={{ boxShadow: "var(--shadow-panel)" }}>
        <p className="font-sans font-semibold text-panel-ink text-sm mb-3">
          Nueva categoría
        </p>
        <label className="text-xs font-medium text-ink/60 block mb-1">Nombre</label>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="ej. chamarras"
          className="w-full border border-brown/15 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brown/40 mb-3"
        />
        <button
          type="button"
          onClick={addCategory}
          className="w-full bg-brown-dark hover:bg-ink text-cream font-semibold py-2.5 rounded-full transition-colors"
        >
          Crear categoría
        </button>
      </div>

      {!loading && (
        <div className="flex flex-col gap-3 max-w-xl">
          {categories.length === 0 && (
            <p className="text-ink/40 text-sm text-center py-4">Todavía no hay categorías</p>
          )}
          {categories.map((c, i) => (
            <div
              key={c.id}
              className="bg-panel-surface rounded-xl border border-panel-border p-4 flex items-center gap-3"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="w-7 h-6 rounded bg-cream flex items-center justify-center text-brown-dark disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === categories.length - 1}
                  className="w-7 h-6 rounded bg-cream flex items-center justify-center text-brown-dark disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2 min-w-0">
                <Tag className="w-4 h-4 text-brown-dark/40 shrink-0" />
                <span className="text-sm text-ink truncate">{c.name}</span>
              </div>

              <button
                onClick={() => setEditing(c)}
                className="w-9 h-9 rounded-xl bg-cream hover:bg-cream/70 flex items-center justify-center text-brown-dark shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setToDelete(c)}
                className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <EditCategoryModal
        open={!!editing}
        category={editing}
        onSave={saveEdit}
        onClose={() => setEditing(null)}
      />

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
