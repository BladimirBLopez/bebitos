"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, Edit, X, Save, ShieldCheck, User, Mail, Lock, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import Select from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { usuarioSchema, UsuarioFormValues, USER_ROLES } from "@/lib/schemas/usuario";
import { FormInput } from "@/components/form/FormField";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: (typeof USER_ROLES)[number];
  active: boolean;
};

const emptyForm: UsuarioFormValues = { name: "", email: "", password: "", role: "ADMIN" };

export default function AdminUsuariosPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [toDelete, setToDelete] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema(!!editing)),
    defaultValues: emptyForm,
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
    } catch {
      setError("Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function openNewModal() {
    setEditing(null);
    setError("");
    reset(emptyForm);
    setShowModal(true);
  }

  function openEditModal(user: Usuario) {
    setEditing(user);
    setError("");
    reset({ name: user.name, email: user.email, password: "", role: user.role });
    setShowModal(true);
  }

  async function onSubmit(values: UsuarioFormValues) {
    setError("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      if (editing && !values.password) delete payload.password;

      const res = await fetch(`/api/admin/users${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al crear/editar");
        setSaving(false);
        return;
      }
      setShowModal(false);
      setEditing(null);
      reset(emptyForm);
      showToast(editing ? "Usuario actualizado" : "Usuario creado", "success");
      fetchUsers();
    } catch {
      setError("Error interno");
    } finally {
      setSaving(false);
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
    } catch {
      showToast("Error interno", "error");
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        meta="Lista de administradores y sus roles"
        action={
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-brown-dark hover:bg-ink text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Usuario
          </button>
        }
      />

      {error && <p className="text-red-600 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-panel-ink-soft">Cargando...</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-panel-surface rounded-xl border border-panel-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="font-sans font-bold text-panel-ink">{user.name}</p>
                <p className="text-sm text-panel-ink-soft">{user.email}</p>
                <p className="text-xs mt-1 text-panel-ink-soft">
                  {user.active ? "Activo" : "Inactivo"} | {user.role}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(user)}
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
          ))
        )}
      </div>

      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] z-50" />
          <Dialog.Content className="fixed z-[51] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-panel-surface rounded-2xl shadow-xl max-h-[90vh] flex flex-col focus:outline-none overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-panel-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brown-dark/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-brown-dark" />
                  </div>
                  <div>
                    <Dialog.Title className="text-base font-bold text-panel-ink leading-tight">
                      {editing ? "Editar Usuario" : "Crear Usuario"}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-panel-ink-soft mt-0.5">
                      {editing ? "Actualiza acceso y rol" : "Da acceso al panel de administración"}
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

              {/* Body */}
              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                <FormInput
                  label="Nombre"
                  icon={User}
                  required
                  placeholder="Ej. Ana Pérez"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <FormInput
                  label="Email"
                  icon={Mail}
                  required
                  type="email"
                  placeholder="ana@bebitos.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <FormInput
                  label="Contraseña"
                  icon={Lock}
                  required={!editing}
                  hint={editing ? "dejar en blanco para no cambiar" : undefined}
                  type="password"
                  placeholder={editing ? "••••••••" : "Mínimo 6 caracteres"}
                  error={errors.password?.message}
                  {...register("password")}
                />

                <div>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className="text-xs font-semibold text-panel-ink tracking-wide mb-1.5 block">
                          Rol<span className="text-amber ml-0.5">*</span>
                        </label>
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={USER_ROLES.map((r) => ({ value: r, label: r }))}
                        />
                      </div>
                    )}
                  />
                  {errors.role && (
                    <p className="text-red text-xs mt-1.5">{errors.role.message}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
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
                  {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear Usuario"}
                </button>
              </div>
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
