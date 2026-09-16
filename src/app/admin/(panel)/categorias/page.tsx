"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Tag, ChevronUp, ChevronDown, Pencil, Trash2, Save } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import ConfirmModal from "@/components/ConfirmModal";
import PageHeader from "@/components/PageHeader";
import { FormInput } from "@/components/form/FormField";
import { categoriaSchema, CategoriaFormValues } from "@/lib/schemas/categoria";
import { useCurrentUser } from "@/lib/user-context";
import { canDelete } from "@/lib/roles";

type Category = { id: string; name: string; order: number };

function EditCategoryModal({
  open,
  category,
  onSave,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onSave: (id: string, name: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (category) reset({ name: category.name });
  }, [category, reset]);

  if (!category) return null;

  async function onSubmit(values: CategoriaFormValues) {
    setSaving(true);
    const ok = await onSave(category!.id, values.name);
    setSaving(false);
    if (ok) reset({ name: "" });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-[90]" />
        <Dialog.Content className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-panel-surface rounded-2xl shadow-xl focus:outline-none overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-panel-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-brown-dark" />
                </div>
                <div>
                  <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                    Editar categoría
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                    Los productos con esta categoría se actualizan solos
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="text-panel-ink-soft hover:text-panel-ink hover:bg-panel-bg rounded-lg p-1.5 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="px-6 py-5">
              <FormInput
                label="Nombre"
                icon={Tag}
                required
                autoFocus
                placeholder="ej. chamarras"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-panel-border bg-panel-bg/50">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 text-sm font-semibold text-panel-ink-soft hover:text-panel-ink py-2.5 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={saving}
                className="flex-[2] flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-semibold text-sm py-2.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function CategoriasPage() {
  const { showToast } = useToast();
  const { role } = useCurrentUser();
  const canRemove = canDelete(role);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  async function onCreate(values: CategoriaFormValues) {
    setCreating(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name }),
    });
    setCreating(false);
    if (res.ok) {
      const created = await res.json();
      setCategories((c) => [...c, created]);
      reset({ name: "" });
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
      return true;
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || "No se pudo actualizar", "error");
      return false;
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

      <form
        onSubmit={handleSubmit(onCreate)}
        className="bg-panel-surface rounded-xl border border-panel-border p-5 max-w-xl mb-4"
        style={{ boxShadow: "var(--shadow-panel)" }}
      >
        <p className="font-sans font-semibold text-panel-ink text-sm mb-3">
          Nueva categoría
        </p>
        <div className="mb-3">
          <FormInput
            label="Nombre"
            icon={Tag}
            required
            placeholder="ej. chamarras"
            error={errors.name?.message}
            {...register("name")}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 bg-brown-dark hover:bg-ink text-cream font-semibold py-2.5 rounded-lg disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creando..." : "Crear categoría"}
        </button>
      </form>

      {!loading && (
        <div className="flex flex-col gap-3 max-w-xl">
          {categories.length === 0 && (
            <p className="text-panel-ink-soft text-sm text-center py-4">Todavía no hay categorías</p>
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
                  className="w-7 h-6 rounded bg-panel-bg flex items-center justify-center text-brown-dark disabled:opacity-30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === categories.length - 1}
                  className="w-7 h-6 rounded bg-panel-bg flex items-center justify-center text-brown-dark disabled:opacity-30"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2 min-w-0">
                <Tag className="w-4 h-4 text-brown-dark/40 shrink-0" />
                <span className="text-sm text-panel-ink truncate">{c.name}</span>
              </div>

              <button
                onClick={() => setEditing(c)}
                className="w-9 h-9 rounded-xl bg-panel-bg hover:bg-panel-border flex items-center justify-center text-brown-dark shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {canRemove && (
                <button
                  onClick={() => setToDelete(c)}
                  className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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
