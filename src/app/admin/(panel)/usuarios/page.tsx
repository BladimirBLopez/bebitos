"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X, Save } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

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
        setDebugInfo(data.debug || null);
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
      fetchUsers();
    } catch (err) {
      setError("Error interno");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
      } else {
        setError("Error al eliminar");
      }
    } catch (err) {
      setError("Error interno");
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

      {error && (
        <div className="mb-4">
          <p className="text-red-600 bg-red-50 p-2 rounded">{error}</p>
          {debugInfo && (
            <pre className="text-xs bg-black text-lime-400 p-3 rounded mt-2 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-panel-ink-soft">Loading...</p>
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
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
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
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-panel-surface rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-panel-ink">
                {editing ? "Editar Usuario" : "Crear Usuario"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-panel-ink-soft">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full border border-panel-border rounded-lg px-3 py-2"
              />
              {!editing && (
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full border border-panel-border rounded-lg px-3 py-2"
                />
              )}
              <div className="w-full border border-panel-border rounded-lg px-3 py-2">
                <label className="text-xs text-panel-ink-soft">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full outline-none"
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
              {editing ? "Editar" : "Crear"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
