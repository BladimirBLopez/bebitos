"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, Edit, X, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/lib/toast-context";

export default function AdminUsuariosPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.error || "Error al listar usuarios");
      }
    } catch (err) {
      setError("Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`/api/admin/users${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear/editar");
        return;
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: "", email: "", password: "", role: "ADMIN" });
      showToast(editing ? "Usuario actualizado" : "Usuario creado", "success");
      fetchUsers();
    } catch (err) {
      setError("Error interno");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/admin/users/${toDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Usuario eliminado", "success");
        fetchUsers();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch (err) {
      showToast("Error interno", "error");
    } finally {
      setToDelete(null);
    }
  }

  const roles = ["ADMIN", "EDITOR", "VIEWER"];

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        meta="Lista de administradores y sus roles"
        action={
          <button
            onClick={() => {
              setEditing(null);
              setFormData({ name: "", email: "", password: "", role: "ADMIN" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Usuario
          </button>
        }
      />

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4">{error}</p>}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-panel-ink-soft">Cargando...</p>
        ) : (
          <>
            {users.map((user) => (
              <div key={user.id} className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-sans font-bold text-panel-ink">{user.name}</p>
                  <p className="text-sm text-panel-ink-soft">{user.email}</p>
                  <p className="text-xs mt-1 text-panel-ink-soft">
                    {user.active ? "Activo" : "Inactivo"} | {user.role}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(user);
                      setFormData({ name: user.name, email: user.email, password: "", role: user.role });
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 text-sm text-brown-dark hover:bg-panel-bg p-2 rounded"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => setToDelete(user)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed z-[51] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-panel-surface rounded-2xl p-6 focus:outline-none">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-bold text-panel-ink">
                  {editing ? "Editar Usuario" : "Crear Usuario"}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className="text-panel-ink-soft">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-panel-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full border border-panel-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
                />
                {!editing && (
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full border border-panel-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-dark/30"
                  />
                )}
                <div className="w-full border border-panel-border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-brown-dark/30">
                  <label className="text-xs text-panel-ink-soft">Rol</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full outline-none bg-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-brown-dark hover:bg-ink text-cream font-semibold py-2.5 rounded-lg"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {editing ? "Guardar cambios" : "Crear"}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmModal
        open={!!toDelete}
        title="¿Borrar este usuario?"
        message={toDelete ? `Se eliminará el acceso de "${toDelete.name}" permanentemente.` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
