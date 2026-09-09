"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [order, setOrder] = useState(0);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data);
      } else {
        setError(data.error || "Error al listar categorías");
      }
    } catch (err) {
      setError("Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/admin/categories${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, order }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear/editar");
        return;
      }
      setShowModal(false);
      setEditing(null);
      setName("");
      setOrder(0);
      fetchCategories();
    } catch (err) {
      setError("Error interno");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/admin/categories/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCategories();
      } else {
        setError("Error al eliminar");
      }
    } catch (err) {
      setError("Error interno");
    }
    setConfirmDelete(null);
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Categorías"
        meta="Lista de categorías y sus ordenes"
        action={
          <button
            onClick={() => {
              setEditing(null);
              setName("");
              setOrder(0);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Categoría
          </button>
        }
      />

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-panel-ink-soft">Loading...</p>
        ) : (
          <>
            {categories.map((category) => (
              <div key={category.id} className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-sans font-bold text-panel-ink">{category.name}</p>
                  <p className="text-sm text-panel-ink-soft">Order: {category.order}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(category);
                      setName(category.name);
                      setOrder(category.order);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:bg-blue-50 p-2 rounded"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(category)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editing ? "Editar Categoría" : "Crear Categoría"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="number"
                placeholder="Order"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-brown-dark hover:bg-ink text-cream font-semibold py-2.5 rounded-lg"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {editing ? "Editar" : "Crear"}
            </button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar "${confirmDelete?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
