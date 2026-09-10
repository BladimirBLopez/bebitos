"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, X, Save, MessageCircle, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/lib/toast-context";

type Cliente = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
};

const emptyForm = { name: "", phone: "", email: "", address: "", notes: "" };

export default function AdminClientesPage() {
  const { showToast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchClientes() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clientes");
      const data = await res.json();
      if (res.ok) {
        setClientes(data);
      } else {
        setError(data.error || "Error al listar clientes");
      }
    } catch {
      setError("Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clientes${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        setSaving(false);
        return;
      }
      setShowModal(false);
      setEditing(null);
      setFormData(emptyForm);
      showToast(editing ? "Cliente actualizado" : "Cliente creado", "success");
      fetchClientes();
    } catch {
      setError("Error interno");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/admin/clientes/${toDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setClientes((prev) => prev.filter((c) => c.id !== toDelete.id));
        showToast("Cliente borrado", "success");
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch {
      showToast("Error interno", "error");
    } finally {
      setToDelete(null);
    }
  }

  const filtered = clientes.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        meta={loading ? "Cargando..." : `${clientes.length} cliente${clientes.length === 1 ? "" : "s"} registrado${clientes.length === 1 ? "" : "s"}`}
        action={
          <button
            onClick={() => {
              setEditing(null);
              setFormData(emptyForm);
              setError("");
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        }
      />

      {clientes.length > 0 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="w-4 h-4 text-panel-ink-soft absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-panel-border rounded-lg pl-9 pr-3 py-2 text-sm bg-panel-surface"
          />
        </div>
      )}

      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>
      )}

      {loading ? (
        <p className="text-panel-ink-soft text-sm">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-panel-ink-soft text-sm text-center py-10">
          {clientes.length === 0
            ? "Todavía no hay clientes registrados."
            : "No se encontraron clientes con ese criterio."}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans font-bold text-panel-ink truncate">{cliente.name}</p>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <p className="text-sm text-panel-ink-soft">{cliente.phone}</p>
                  {cliente.email && <p className="text-sm text-panel-ink-soft">· {cliente.email}</p>}
                </div>
                {cliente.address && (
                  <p className="text-xs text-panel-ink-soft mt-1 truncate">{cliente.address}</p>
                )}
                {cliente.notes && (
                  <p className="text-xs text-panel-ink-soft mt-1 italic truncate">{cliente.notes}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`https://wa.me/${cliente.phone.startsWith("591") ? cliente.phone : "591" + cliente.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green/15 hover:bg-green/25 text-green-dark text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <button
                  onClick={() => {
                    setEditing(cliente);
                    setFormData({
                      name: cliente.name,
                      phone: cliente.phone,
                      email: cliente.email || "",
                      address: cliente.address || "",
                      notes: cliente.notes || "",
                    });
                    setError("");
                    setShowModal(true);
                  }}
                  className="flex items-center gap-1 text-sm text-brown-dark hover:bg-panel-bg p-2 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setToDelete(cliente)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 p-2 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-panel-surface rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-panel-ink">
                {editing ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-panel-ink-soft">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="WhatsApp (solo números, ej. 70123456)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
              <textarea
                placeholder="Notas internas (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 bg-brown-dark hover:bg-ink text-cream font-semibold py-2.5 rounded-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear Cliente"}
            </button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar este cliente?"
        message={toDelete ? `Se eliminará el registro de "${toDelete.name}" permanentemente.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
