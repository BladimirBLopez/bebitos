"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "./ConfirmModal";

type Category = { id: string; name: string };

export default function CategoryManagerModal({
  open,
  categories,
  setCategories,
  onSelect,
  onClose,
}: {
  open: boolean;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onSelect?: (name: string) => void;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [toDelete, setToDelete] = useState<Category | null>(null);

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
      onSelect?.(created.name);
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
      showToast("Categoría actualizada", "success");
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
    <>
      <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[90]" />
          <Dialog.Content className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl p-6 max-h-[80vh] flex flex-col focus:outline-none">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-display font-semibold text-ink text-lg">
                Categorías
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-ink/40 hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
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

            <div className="flex flex-col gap-1.5 overflow-y-auto">
              {categories.length === 0 && (
                <p className="text-ink/40 text-sm text-center py-4">Todavía no hay categorías</p>
              )}
              {categories.map((c) =>
                editingId === c.id ? (
                  <div key={c.id} className="flex items-center gap-1 bg-cream rounded-xl px-2 py-1.5">
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
                  <div key={c.id} className="flex items-center justify-between bg-cream rounded-xl px-3 py-2">
                    <button
                      onClick={() => onSelect ? onSelect(c.name) : startEdit(c)}
                      className="flex-1 text-left text-sm text-ink"
                    >
                      {c.name}
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => startEdit(c)} className="text-brown-dark/50 hover:text-brown-dark text-xs font-medium">
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar categoría?"
        message={toDelete ? `Los productos con "${toDelete.name}" quedarán sin categoría asignada.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
